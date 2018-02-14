---
title: "CanJS nodeLists and How They Work"
author: "Bradley Momberger"
---

This document is a draft of a Markdown reference file for [can-view-nodelist](https://github.com/canjs/can-view-nodelist).  I've been trying to write up a deep understanding of how this library works, because it's vital to the CanJS view layer yet somewhat obscure.  Trying to work on new versions of [can-stache](https://github.com/canjs/can-stache) or even new templating languages necessitates knowing the lower level view libraries inside and out.

Nodelists are a hard concept to understand in the internal workings of CanJS, but they are done the way they are out of practical considerations (mostly for execution speed, but also diverting most resources to the user API rather than hardening lower level APIs).  nodeLists are a way of registering tree relationships between groups of nodes, without those nodes being direct parents and children of each other.  With nodeLists, a text node (which cannot, by DOM rules, have children) can be a stand-in node that "hydrates" into a rendered subsection of other nodes, and its callback can replace the subsection as needed.

# nodeLists

NodeLists are, fundamentally, Arrays or ArrayLikes.  To create a nodeList, one first creates an Array of contiguous DOM elements, then lets the nodeList engine calculate the maximally nested set of nodeLists (where if a nodeList can take the place of a subsequence of the nodes in the nodeList, it is replaced by the same).

> The algorithm for doing this second part is fast and unsophisticated.  If you have a member of a registered nodeList in your new nodeList, it is assumed to be followed by all the rest of the members of the registered nodeList.  In this way, it's more like grouping than creating a tree.

Additionally, a nodeList can be registered as a child list or a replacement for an existing nodeList, rather than being placed into the global node map.  Whether the parent-child pattern is used for a nodeList or not is based on the call pattern when the nodeList is `register()`'ed.

# Registering

The first steps of registering a nodeList, i.e. processing an Array of nodes into something with parent-child relationship knowledge, are very straightforward.  There is a numeric `nesting` property set, which is useful for understanding ordering of chains of can-compute bindings (it is used to set a compute's depth in `can-stache-bindings`).  It's not used internally after being set, so no further commentary is offered here.  The `unregistered` callback passed in to the function is also added to the nodeList.

From there on, there are two widly different code paths needed when registering a nodeList.  The simpler of them, addressed in Nesting below (and being the primary pattern used in `can-view-live`), creates a nested list-of-lists out of a flat nodeList if there is no extant parentList to worry about.

The other is when there is a supplied parent nodeList, as happens in nodes directly registered in `can-component` and `can-stache`.  Unlike the previous case which sets the nodeList directly on the global nodeMap, the parent case is transactional and requires and update step.  In the parent case we have three possible paths to go down:

* A special case is to register and pass `true` as the parent nodeList.  This is a case for when a nodeList intends to be a parentList to another nodeList, but it is not itself being registered to a parentList.

* The case with a parent nodeList and directlyNested having a truthy value, pushes the nodeList onto the parent nodeList's `replacements` (the nodeList is pushed as a whole rather than its elements).  `replacements` is used when updating the nodeList; this essentially means that updating a _parent_ nodeList with new nodes is _transactional_.

* The case with a parent nodeList and directlyNested having a falsy value, pushes the nodeList onto the parent nodeList's `newDeepChildren` (the nodeList is pushed as a whole rather than its elements).  Again, because registration with a parent is transactional, `newDeepChildren` will be set as `deepChildren` when `update` is called.

Here's an example of registering a list as a deep child (not a replacement) of another list:

```js
const list1 = [ document.createTextNode( "" ) ];
const list2 = [ document.createTextNode( "a" ), document.createTextNode( "1" ) ];

nodeLists.register( list1, null, true );
nodeLists.register( list2, null, list1 );

list1.deepChildren; // -> []
list1.newDeepChildren; // -> [Array[2]]
list1.newDeepChildren[ 0 ] === list2; // -> true
list2.parentList === list1; // -> true

const list3 = [
	document.createTextNode( "b" ),
	document.createTextNode( "2" ),
	document.createTextNode( "ii" )
];
nodeLists.register( list3, null, list1, true );

list1.replacements; // -> [Array[3]]
list3.parentList === list1; // -> true
```

`list1` now has a "new" deep child in `list2` and a replacement in `list3`.  These don't mean anything by themselves.  What has to happen from here is that the nodeList will be `update`d with new contents, which *may* contain `list2` and/or `list3`.

# Nesting

`nestList` is called anytime a nodeList is registered without a known parent.
This does not mean that it's a top-level nodeList, since it may just be a step
in the process of registering a full tree of nodes.  This nodeList may later
be included into other nodeLists.

The first element of a nodeList is important when nesting, because it will be the expected
element to pull an existing sublist out of the nodeMap.  So for example, we have this nodeMap

	span1 => [span1, span2]
	span2 => [span1, span2]
	label1 => [label1]

All elements in the nodeMap were previously registered by calling register on these lists.
Since span1 comes first, it will be the key to recognizing the spans list while nesting.

To demonstrate register a list of nodes that covers the spans and the label, and adds in new texts

	[text1, span1, span2, text2, label2]

nestList() will iterate over this list, and when it finds a match, it will replace contiguous nodes
with the list that contains them.  For efficiency, this always assumes that the subsequence of nodes
replaced by a list (keyed on its first element in the map) is the same as the sequence of nodes in the
list being swapped in.

So our four steps iterating over are thus:

1. text1 is not found in the node map, so it is added as a key, mapping to the full nodeList
2. span1 is found in the nodeMap.  It, and span2, are both removed from the nodeList and replaced with the nodeList [span1, span2], because this is the nodeList keyed on span1 in the nodeMap.
3. text2 is not found in the nodeMap, so it is added as a key, mapping to the full nodeList
4. label1 is found in the nodeMap, so it is replaced by the label1 nodeList.

At the end our nodelist looks like this:

	[text1, [span1, span2], text2, [labell]]

And our nodeMap is this:

	span1 => [span1, span2]
	span2 => [span1, span2]
	label1 => [label1]
	text1 => [text1, [span1, span2], text2, [labell]]
	text2 => [text1, [span1, span2], text2, [labell]]

# Nesting Replacements

The parent/child nodeList pattern uses the replacements array on the parent nodeList as the source for creating a temporary `nodeMap` rather than the permanent `nodeLists.nodeMap` map.  This is because the unused replacements are placed into `newDeepChildren` along with any existing contents therein.  At the time of node updating the combined `newDeepChildren` will become the `deepChildren`

# Unregistering

Unregistering a nodeList means that all of its descendant child nodeLists must be called with their respective teardown callback (set during `nodeLists.register()`), and all nodeLists in the descendant tree which are included in the parent nodeList's `deepChildren` (if there is a `parentList`) must be removed from the `deepChildren`.  

> Note that unregistering is *only* necessary for tearing down parent-child registration.  For efficiency, the necessary properties for unregistering are not set unless a parent-child relationship has been previously register()'ed.

There are two mutually recursive functions that cover this flow, `unregister()` and `unregisterChildren()`. Essentially you could term these "unregister me" and "unregister everything below me", respectively.  `unregister()` has two modes, one for direct children and one for deep children.

Let's go back and look at the nodeMap from the Nesting section above.  If we were to unregister `[span1, span2]`, the nodeMap would look like this:

	label1 => [label1]
	text1 => [text1, [span1, span2], text2, [labell]]
	text2 => [text1, [span1, span2], text2, [labell]]

The entries for each member of that nodeList (viz., `span1` and `span2`) are removed from the nodeMap.  That nodelist didn't have any children, so no other nodeLists were unregistered; by contrast, had we removed `text1`'s nodeList, all of the nodeLists would have been removed.  Also of node, the `[span1, span2]` nodeList **is still in the parent list**.  Though the nodelist was unregistered, updating its contents or removing it from parents is a completely separate process.


# Updating

Updates on a nodeList are the true reason for nodeLists to exist in their form.  A call to `nodeLists.update()` changes the content of the nodeList; in non-parent-child contexts, all nodeLists in which the nodeList is nested are updated automatically because they contain the nodeList by reference.  In parent-child contexts, this commits the replacements to the list itself and moves to the deepChildren array all of the newDeepChildren **and** all of the replacements that didn't match nodes in the new nodeList content.

The first thing that an update does is unregister the children.  They are *not* removed from the list at this time, but they are unregistered recursively from the nodeMap.  All nodes that are elements of the parent nodeList are unregistered, and all child nodeLists are unregistered as well.  The unregistering process returns the old nodes from the nodeList, flattened into an Array.

The second step is using Array splice to replace the content of the nodeList with the new nodes.

The third and final step is contingent upon whether these are parent/child nodeLists or global nodeLists.  In the former case, `nestReplacements()` is called on the nodeList and the flow we talked about in Nesting Replacements happens.  Then `newDeepChildren` is passed over to `deepChildren` while `newDeepChildren` becomes a new empty Array.  In the latter case, the list is simply nested against the global `nodeMap`.  Finally, the flat array of old nodes is returned (the old nodes are not necessarily unused, as the new lists could contain some or all of the same nodes).

# DOM Mutation

There are library functions in nodeLists for working with the nodes in a nodeList on the DOM.  When using these, a nodeList should be flattened to an Array using `nodeLists.flatten()`, or only specific elements in the nodeList should be passed in as a flat Array.  These functions do not work with nodeLists containing other nodeLists, and may cause unexpected behavior if elements of the passed-in Arrays have different parent nodes.

* `after()` inserts the contents of a document fragment after the nodes in a specified Array, using the last element of the Array as a reference point.  This *does not* add the frag's contents to the Array; you must separately push them on.

* `replace()` takes an Array and a frag and replaces the entire contents of the Array with the new node fragment on the DOM, without updating the original Array.  There is a special handler here for ensuring that the selected item for a `<select>` remains selected, if replacing `<option>` children of a `<select>`.

* `remove()` detaches all node members of an Array from a common DOM parent, taken from the first element of the Array.


# Some example flows

Here's the source of `can.view.live.replace()`:

```js
{
	replace: function( nodes, val, teardown ) {

		// #### replace
		// Replaces one element with some content while keeping nodeLists data
		// correct.
		//
		// Take a copy of old nodeList
		const oldNodes = nodes.slice( 0 ), frag = makeFrag( val );

		// Register a teardown callback
		nodeLists.register( nodes, teardown );

		// Mark each node as belonging to the node list.
		nodeLists.update( nodes, childNodes( frag ) );

		// Replace old nodes with new on the DOM
		nodeLists.replace( oldNodes, frag );
		return nodes;
	}
}
```

This is generally how the flow works when working with the global nodeMap.  First be sure that the nodeList is `register()`ed to have all of the trees and everything contained in the nodeMap, then `update()` the nodeList to have the new nodes from the frag (this doesn't call the `teardown` supplied here but it does call unregister functions during any child nodeList's registration), then finally `replace()` the old nodes in the DOM with the content of the fragment.

For the second one we'll have to jump around a bit.  This flow starts when we render a partial into a parent Stache.  So we'll call `makeLiveBindingPartialRenderer()` from `can-stache`'s mustache_core.js.  This sets up a new parent nodeList based on the text node that's the placeholder for this partial before the Stache hydrates.

```js
const nodeList = [ this ];
```

Farther down this function, a `renderer` callback references this nodelist and hydrates into this nodeList the fragment created by rendering the partial template.

```js
renderer = function() {
	if ( typeof localPartialName === "function" ) {
		return localPartialName( scope, options, nodeList );
	} else {
		return core.getTemplateById( localPartialName )( scope, options, nodeList );
	}
};
```

So now when this is called, `localPartialName` is either a function (from the scope), or it's a string (referencing the DOM) and gets resolved to a function.  This function is returned from `stache.compile()` via `HTMLSectionBuilder.prototype.compile()`, is usually called a "renderer," and takes as arguments scope, options, and nodeList.  Scope is the only required argument, but the fact that we're passing in a `nodeList` is key here.  This renderer gets the compiled AST for the Stache template, does a couple cursory checks on scope and options then does this:

```js
compiled.hydrate( scope, options, nodeList );
```

Let's assume that we have some callbacks to hydrate.  If the Stache only had raw text, the hydrator would just return a frag and not set anything up.  Let's see what happens when we have a scope lookup like `{{foo}}`, which triggers a callback to `makeLiveBindingBranchRenderer()` in mustache_core.js

```js
function branchRenderer( scope, options, parentSectionNodeList, truthyRenderer, falseyRenderer ) {
	const nodeList = [ this ];
	nodeList.expression = expressionString;
	nodeLists.register( nodeList, null, parentSectionNodeList || true, state.directlyNested );
}
```

`parentSectionNodeList` contains the node in the parent Stache rendering where the partial was called.  `nodeList = [this]` is now a nodeList containing the node for `{{foo}}`.  So you can see that the registration of the lookup expression is a child of the partial.  If the partial were later removed completely from the surrounding template, all of the nodes we're currently constructing would have to be unregistered and moved.  `state.directlyNested` is true here because we want the content of the rendered partial to completely replace any placeholder nodes.

Most of the function is now spent setting up a compute, but then we have to actually set up the rendering.  That is accomplished by using the library functions in [can-view-live](https://github.com/canjs/can-view-live), in this case one to render plain text:

```js
live.text( this, computeValue, this.parentNode, nodeList );
```

Because we pass a nodeList into `live.text()`, it knows that the nodes should be updated and replaced through operating on the nodeList like this:

```js
const node = el.ownerDocument.createTextNode( live.makeString( compute() ) );
if ( nodeList ) {
	nodeList.unregistered = data.teardownCheck;
	data.nodeList = nodeList;
	nodeLists.update( nodeList, [ node ] );
	nodeLists.replace( [ el ], node );
}
```

`data` is an object created by `live.listen()`, and isn't particularly important to know here.  But what is important to note is the nodeList is updated with a text node containing the rendered text content (from calling `compute()`) and then the element that was being used as a placeholder (`el`) is replaced in the DOM by the rendered text node.  The parent nodeList, containing the placeholder for the partial, also has gotten the directly nested child nodeList's content updated into it via calling `live.html()`.  I avoided using that code for demonstration because it's a bit less clear in what it's doing.

In all of these cases the flow to nodeLists is the same:  first is register, then update, then replace.  This pattern is repeated for update and replace in `live.html()` and `live.text()` as the compute gets new values, with possible replacements being registered in subtrees as needed.
