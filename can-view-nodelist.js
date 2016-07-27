var CID = require('can-util/js/cid/cid');
var makeArray = require('can-util/js/make-array/make-array');
var each = require('can-util/js/each/each');
var namespace = require('can-util/namespace');
var domMutate = require('can-util/dom/mutate/mutate');
// # can/view/node_lists/node_list.js
//
// ## Helpers
// Some browsers don't allow expando properties on HTMLTextNodes
// so let's try to assign a custom property, an 'expando' property.
// We use this boolean to determine how we are going to hold on
// to HTMLTextNode within a nodeList.  More about this in the 'id'
// function.
var canExpando = true;
try {
	document.createTextNode('')._ = 0;
} catch (ex) {
	canExpando = false;
}

// A mapping of element ids to nodeList id allowing us to quickly find an element
// that needs to be replaced when updated.
var nodeMap = {},
	// A mapping of ids to text nodes, this map will be used in the
	// case of the browser not supporting expando properties.
	textNodeMap = {},
	// The name of the expando property; the value returned
	// given a nodeMap key.
	expando = 'stache_' + Math.random(),
	// The id used as the key in our nodeMap, this integer
	// will be preceded by 'element_' or 'obj_' depending on whether
	// the element has a nodeName.
	_id = 0,

/** @function can-view-nodelist.id id
    @hide
    @parent can-view-nodelist
    @signature `nodeLists.id(node, localMap)`
		@param {Object} node an HTML element, text node, or other object
		@param {Object} [localMap] an optional map for text node IDs
		@return {String} the ID value generated for the node.

	Given a template node, create an id on the node as a expando
	property, or if the node is an HTMLTextNode and the browser
	doesn't support expando properties store the id with a
	reference to the text node in an internal collection then return
	the lookup id.

	*/
	id = function (node, localMap) {
		var _textNodeMap = localMap || textNodeMap;
		var id = readId(node,_textNodeMap);
		if(id) {
			return id;
		} else {
			// If the browser supports expando properties or the node
			// provided is not an HTMLTextNode, we don't need to work
			// with the internal textNodeMap and we can place the property
			// on the node.
			if (canExpando || node.nodeType !== 3) {
				++_id;
				return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
			} else {
				// If we didn't find the node, we need to register it and return
				// the id used.
				++_id;

				// If we didn't find the node, we need to register it and return
				// the id used.
				//
				// We have to store the node itself because of the browser's lack
				// of support for expando properties (i.e. we can't use a look-up
				// table and store the id on the node as a custom property).
				_textNodeMap['text_' + _id] = node;
				return 'text_' + _id;
			}
		}
	},
	readId = function(node,textNodeMap){
		if (canExpando || node.nodeType !== 3) {
			return node[expando];
		} else {
			// The nodeList has a specific collection for HTMLTextNodes for
			// (older) browsers that do not support expando properties.
			for (var textNodeID in textNodeMap) {
				if (textNodeMap[textNodeID] === node) {
					return textNodeID;
				}
			}
		}
	},
	splice = [].splice,
	push = [].push,

	// ## nodeLists.itemsInChildListTree
	// Given a nodeList return the number of child items in the provided
	// list and any child lists.
	itemsInChildListTree = function(list){
		var count = 0;
		for(var i = 0, len = list.length ; i < len; i++){
			var item = list[i];
			// If the item is an HTMLElement then increment the count by 1.
			if(item.nodeType) {
				count++;
			} else {
				// If the item is not an HTMLElement it is a list, so
				// increment the count by the number of items in the child
				// list.
				count += itemsInChildListTree(item);
			}
		}
		return count;
	},
	replacementMap = function(replacements, idMap){
		var map = {};
		for(var i = 0, len = replacements.length; i < len; i++){
			var node = nodeLists.first(replacements[i]);
			map[id(node, idMap)] = replacements[i];
		}
		return map;
	},
	addUnfoundAsDeepChildren = function(list, rMap, foundIds){
		for(var repId in rMap) {
			if(!foundIds[repId]) {
				list.newDeepChildren.push(rMap[repId]);
			}
		}
	};

// ## Registering & Updating
//
// To keep all live-bound sections knowing which elements they are managing,
// all live-bound elments are registered and updated when they change.
//
// For example, the above template, when rendered with data like:
//
//     data = new can.Map({
//         items: ["first","second"]
//     })
//
// This will first render the following content:
//
//     <div>
//         <span data-view-id='5'/>
//     </div>
//
// When the `5` callback is called, this will register the `<span>` like:
//
//     var ifsNodes = [<span 5>]
//     nodeLists.register(ifsNodes);
//
// And then render `{{if}}`'s contents and update `ifsNodes` with it:
//
//     nodeLists.update( ifsNodes, [<"\nItems:\n">, <span data-view-id="6">] );
//
// Next, hookup `6` is called which will regsiter the `<span>` like:
//
//     var eachsNodes = [<span 6>];
//     nodeLists.register(eachsNodes);
//
// And then it will render `{{#each}}`'s content and update `eachsNodes` with it:
//
//     nodeLists.update(eachsNodes, [<label>,<label>]);
//
// As `nodeLists` knows that `eachsNodes` is inside `ifsNodes`, it also updates
// `ifsNodes`'s nodes to look like:
//
//     [<"\nItems:\n">,<label>,<label>]
//
// Now, if all items were removed, `{{#if}}` would be able to remove
// all the `<label>` elements.
//
// When you regsiter a nodeList, you can also provide a callback to know when
// that nodeList has been replaced by a parent nodeList.  This is
// useful for tearing down live-binding.
var nodeLists = {
	id: id,

   /**
	* @function can-view-nodelist.update update
	* @parent can-view-nodelist/methods
	*
	* @signature `nodeLists.update(nodeList, newNodes)`
	*
	* Updates a nodeList with new items, i.e. when values for the template have changed.
	*
	*   @param {can-view-nodelist/types/NodeList} nodeList The list to update with the new nodes.
	*   @param {can-view-nodelist/types/NodeList} newNodes The new nodes to update with.
	*
	*   @return {Array<Node>} The nodes that were removed from `nodeList`.
	*/
	update: function (nodeList, newNodes) {
		// Unregister all childNodeLists.
		var oldNodes = nodeLists.unregisterChildren(nodeList);

		newNodes = makeArray(newNodes);

		var oldListLength = nodeList.length;

		// Replace oldNodeLists's contents.
		splice.apply(nodeList, [
			0,
			oldListLength
		].concat(newNodes));

		// Replacements are nodes that have replaced the original element this is on.
		// We can't simply insert elements because stache does children before parents.
		if(nodeList.replacements){
			nodeLists.nestReplacements(nodeList);
			nodeList.deepChildren = nodeList.newDeepChildren;
			nodeList.newDeepChildren = [];
		} else {
			nodeLists.nestList(nodeList);
		}

		return oldNodes;
	},
   /**
	* @function can-view-nodelist.nestReplacements nestReplacements
	* @parent can-view-nodelist/methods
	* @signature `nodeLists.nestReplacements(list)`
	*
	* Goes through each node in the list. `[el1, el2, el3, ...]`
	* Finds the nodeList for that node in replacements.  el1's nodeList might look like `[el1, [el2]]`.
	* Replaces that element and any other elements in the node list with the
	* nodelist itself. resulting in `[ [el1, [el2]], el3, ...]`
	* If a replacement is not found, it was improperly added, so we add it as a deepChild.
	*
	* @param {can-view-nodelist/types/NodeList} list  The nodeList of nodes to go over
	*
	*/
	nestReplacements: function(list){
		var index = 0,
			// temporary id map that is limited to this call
			idMap = {},
			// replacements are in reverse order in the DOM
			rMap = replacementMap(list.replacements, idMap),
			rCount = list.replacements.length,
			foundIds = {};

		while(index < list.length && rCount) {
			var node = list[index],
				nodeId = readId(node, idMap),
				replacement = rMap[nodeId];
			if( replacement ) {
				list.splice( index, itemsInChildListTree(replacement), replacement );
				foundIds[nodeId] = true;
				rCount--;
			}
			index++;
		}
		// Only do this if
		if(rCount) {
			addUnfoundAsDeepChildren(list, rMap, foundIds );
		}

		list.replacements = [];
	},
	/**
	 * @function can-view-nodelist.nestList nestList
	 * @parent can-view-nodelist/methods
	 * @signature `nodeLists.nestList(list)`
	 *
	 * If a given list does not exist in the nodeMap then create an lookup
	 * id for it in the nodeMap and assign the list to it.
	 * If the the provided does happen to exist in the nodeMap update the
	 * elements in the list.
	 *
	 * @param {can-view-nodelist/types/NodeList} list The nodeList being nested.
	 *
	 */
	nestList: function(list){
		var index = 0;
		while(index < list.length) {
			var node = list[index],
				childNodeList = nodeMap[id(node)];
			if(childNodeList) {
				if(childNodeList !== list) {
					list.splice( index, itemsInChildListTree(childNodeList), childNodeList );
				}
			} else {
				// Indicate the new nodes belong to this list.
				nodeMap[id(node)] = list;
			}
			index++;
		}
	},

	/**
	 * @function can-view-nodelist.last last
	 * @parent can-view-nodelist/methods
	 * @signature `nodeLists.last(nodeList)`
	 *
	 * Return the last HTMLElement in a nodeList; if the last
	 * element is a nodeList, returns the last HTMLElement of
	 * the child list, etc.
	 *
	 * @param {can-view-nodelist/types/NodeList} nodeList A nodeList.
	 * @return {HTMLElement} The last element of the last list nested in this list.
	 *
	 */
	last: function(nodeList){
		var last = nodeList[nodeList.length - 1];
		// If the last node in the list is not an HTMLElement
		// it is a nodeList so call `last` again.
		if(last.nodeType) {
			return last;
		} else {
			return nodeLists.last(last);
		}
	},

	/**
	 * @function can-view-nodelist.first first
	 * @parent can-view-nodelist/methods
	 * @signature `nodeLists.first(nodeList)`
	 *
	 * Return the first HTMLElement in a nodeList; if the first
	 * element is a nodeList, returns the first HTMLElement of
	 * the child list, etc.
	 *
	 * @param {can-view-nodelist/types/NodeList} nodeList A nodeList.
	 * @return {HTMLElement} The first element of the first list nested in this list.
	 *
	 *
	 */
	first: function(nodeList) {
		var first = nodeList[0];
		// If the first node in the list is not an HTMLElement
		// it is a nodeList so call `first` again.
		if(first.nodeType) {
			return first;
		} else {
			return nodeLists.first(first);
		}
	},
	flatten: function(nodeList){
		var items = [];
		for(var i = 0 ; i < nodeList.length; i++) {
			var item = nodeList[i];
			if(item.nodeType) {
				items.push(item);
			} else {
				items.push.apply(items, nodeLists.flatten(item));
			}
		}
		return items;
	},
	/**
	 * @function can-view-nodelist.register register
	 * @parent can-view-nodelist/methods
	 *
	 * @signature `nodeLists.register(nodeList, unregistered, parent, directlyNested)`
	 *
	 * Registers a nodeList and returns the nodeList passed to register.
	 *
	 *   @param {can-view-nodelist/types/NodeList} nodeList A nodeList.
	 *   @param {function()} unregistered A callback to call when the nodeList is unregistered.
	 *   @param {can-view-nodelist/types/NodeList} parent The parent nodeList of this nodeList.
	 *   @param {Boolean} directlyNested `true` if nodes in the nodeList are direct children of the parent.
	 *   @return {can-view-nodelist/types/NodeList} The passed in nodeList.
	 *
	 */
	register: function (nodeList, unregistered, parent, directlyNested) {
		// If a unregistered callback has been provided assign it to the nodeList
		// as a property to be called when the nodeList is unregistred.
		CID(nodeList);
		nodeList.unregistered = unregistered;
		nodeList.parentList = parent;
		nodeList.nesting = parent && typeof parent.nesting !== 'undefined' ? parent.nesting + 1 : 0;

		if(parent) {
			nodeList.deepChildren = [];
			nodeList.newDeepChildren = [];
			nodeList.replacements = [];
			if(parent !== true) {
				if(directlyNested) {
					parent.replacements.push(nodeList);
				}
				else {
					parent.newDeepChildren.push(nodeList);
				}
			}
		}
		else {
			nodeLists.nestList(nodeList);
		}


		return nodeList;
	},

	/**
	 * @function can-view-nodelist.unregisterChildren unregisterChildren
	 * @parent can-view-nodelist/methods
	 * @signature `nodeLists.unregisterChildren(nodeList)`
	 *
	 * Unregister all childen within the provided list and return the
	 * unregistred nodes.
	 *
	 * @param {can-view-nodelist/types/NodeList} nodeList The nodeList of child nodes to unregister.
	 * @return {Array} The list of all nodes that were unregistered.
	 */
	unregisterChildren: function(nodeList){
		var nodes = [];
		// For each node in the nodeList we want to compute it's id
		// and delete it from the nodeList's internal map.
		each(nodeList, function (node) {
			// If the node does not have a nodeType it is an array of
			// nodes.
			if(node.nodeType) {
				if(!nodeList.replacements) {
					delete nodeMap[id(node)];
				}

				nodes.push(node);
			} else {
				// Recursively unregister each of the child lists in
				// the nodeList.
				push.apply(nodes, nodeLists.unregister(node, true));
			}
		});

		each(nodeList.deepChildren, function(nodeList){
			nodeLists.unregister(nodeList, true);
		});

		return nodes;
	},

	/**
		@function can-view-nodelist.unregister unregister
		@parent can-view-nodelist/methods
		@signature `nodeLists.unregister(nodeList, isChild)`
		@param {ArrayLike} nodeList a nodeList to unregister from its parent
		@param {isChild}  true if the nodeList is a direct child, false if a deep child
		@return {Array}   a list of all nodes that were unregistered

		Unregister's a nodeList and returns the unregistered nodes.
		Call if the nodeList is no longer being updated. This will
		also unregister all child nodeLists.
	*/
	unregister: function (nodeList, isChild) {
		var nodes = nodeLists.unregisterChildren(nodeList, true);

		// If an 'unregisted' function was provided during registration, remove
		// it from the list, and call the function provided.
		if (nodeList.unregistered) {
			var unregisteredCallback = nodeList.unregistered;
			nodeList.replacements = nodeList.unregistered = null;
			if(!isChild) {
				var deepChildren = nodeList.parentList && nodeList.parentList.deepChildren;
				if(deepChildren) {
					var index = deepChildren.indexOf(nodeList);
					if(index !== -1) {
						deepChildren.splice(index,1);
					}
				}
			}
			unregisteredCallback();
		}
		return nodes;
	},
	/**
	 * @function can-view-nodelist.after after
	 * @parent can-view-nodelist/methods
	 * @hide
	 * @signature `nodeLists.after(oldElements, newFrag)`
	 *
	 *   Inserts `newFrag` after `oldElements`.
	 *
	 *   @param {ArrayLike<Node>} oldElements The elements to use as reference.
	 *   @param {DocumentFragment} newFrag The fragment to insert.
	 *
	 */
	after: function (oldElements, newFrag) {
		var last = oldElements[oldElements.length - 1];
		// Insert it in the `document` or `documentFragment`
		if (last.nextSibling) {
			domMutate.insertBefore.call(last.parentNode, newFrag, last.nextSibling);
		} else {
			domMutate.appendChild.call(last.parentNode, newFrag );
		}
	},
	/**
	 * @function can-view-nodelist.replace replace
	 * @hide
	 * @parent can-view-nodelist/methods
	 * @signature `nodeLists.replace(oldElements, newFrag)`
	 *
	 * Replaces `oldElements` with `newFrag`.
	 *
	 * @param {Array<Node>} oldElements the list elements to remove
	 * @param {DocumentFragment} newFrag the fragment to replace the old elements
	 *
	 */
	replace: function (oldElements, newFrag) {
		// The following helps make sure that a selected <option> remains
		// the same by removing `selected` from the currently selected option
		// and adding selected to an option that has the same value.
		var selectedValue,
			parentNode = oldElements[0].parentNode;

		if(parentNode.nodeName.toUpperCase() === "SELECT" && parentNode.selectedIndex >= 0) {
			selectedValue = parentNode.value;
		}
		if(oldElements.length === 1) {
			domMutate.replaceChild.call(parentNode, newFrag, oldElements[0]);
		} else {
			nodeLists.after(oldElements, newFrag);
			nodeLists.remove(oldElements);
		}

		if(selectedValue !== undefined) {
			parentNode.value = selectedValue;
		}
	},
	/**
	 * @function can-view-nodelist.remove remove
	 * @parent can-view-nodelist/methods
	 * @hide
	 * @signature `nodeLists.remove(elementsToBeRemoved)`
	 *
	 * Remove all Nodes in `oldElements` from the DOM.
	 *
	 * @param {ArrayLike<Node>} oldElements the list of Elements to remove (must have a common parent)
	 *
	 */
	remove: function(elementsToBeRemoved){
		var parent = elementsToBeRemoved[0] && elementsToBeRemoved[0].parentNode;
		each(elementsToBeRemoved, function(child){
			domMutate.removeChild.call(parent, child);
		});
	},
	nodeMap: nodeMap
};
module.exports = namespace.nodeLists = nodeLists;
