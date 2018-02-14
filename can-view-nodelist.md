@module {Object} can-view-nodelist
@parent can-views
@collection can-infrastructure
@group can-view-nodelist/methods methods
@group can-view-nodelist/types types
@package ./package.json

@description Adds nesting of text nodes

@type {Object}

`can-view-nodelist` is used to make sure nested live-binding
sections are able to be cleaned up.

Consider the following template:

```html
<div>
{{#if items.length}}
    Items:
        {{#items}}
            <label></label>
        {{/items}}
    !
{{/if}}
</div>
```

When `items.length` value changes to 0, the inner content should be removed and the `{{#items}}`
binding should be torn down.

`can-view-nodelist` is used to maintain this structure so all nested bindings can be
recursively torn down.  It's also used to know all the items that need to be removed.

The basic use is

A `target` is going to be hydrated:

```js
target.hydrate( scope );
```

This will call the callbacks on placeholder elements.

Those callbacks register their placeholder like this:

```js
nodeLists.register( nodeList = [ placeholderElement ], null );
```

Then they render the content for the
placeholder.  This will recursively repeat the same process
of hydrating other targets, and registering placeholder
elements.

After the content renders, it will call:

```js
// this doesn't actually update the dom. But this will
// detach any "old" nodeLists within `nodeList`
// but oldNodes are all the nodes within the nodeLists
const oldNodes = nodeLists.update(
	nodeList,
	renderedContentFragment.childNodes );
```

The children calling `.update()` end up adding to the parent `nodeList`'s `.replacements`
array.  `nodList` might look like:

```
[
    TEXT_NODE<>  //original placeholder text node
    replacements: [
        [
            <label>
            expression: "items.0"
        ],
        [
            <label>
            expression: "items.1"
        ]
    ]
]
```

When `.update` is called on `nodeList`, the `renderedContentFragment` will have
the final content for what is being rendered. For example, it will be a fragment like:

```
Items:
<label></label>
<label></label>
!
```

`.update` will:

1. Unregister any child nodeLists previously within `nodeList`. (there won't be any at this point)
2. Make a Map of the first node in a `replacements` nodeList to its nodelist:
   ```
   replacementsMap = Map({
       [<label>]: [
           <label>
           expression: "items.0"
       ],
       [<label>]: [
           <label>
           expression: "items.1"
       ],
   })
   ```
3. Go through the nodes in renderedContentFragment.  If any of them are in the replacementsMap,
   update `nodeList` accordingly. `nodeList` will then look like:
   ```
   [
       TEXT_NODE<"Items: ">,
       [
           <label>
           expression: "items.0"
       ],
       [
           <label>
           expression: "items.1"
       ],
       TEXT_NODE<"!">
   ]
   ```
