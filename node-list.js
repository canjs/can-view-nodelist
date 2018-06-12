// PURPOSE
// To know when some elements have been torn down
// To connect a parent observable behavior to a child
//
//
// Also ... to know which elements to remove as children will create space ...
var childNodes = require("can-child-nodes");
var canReflect = require("can-reflect");
var domMutate = require("can-dom-mutate");
var fragment = require("can-fragment");

function NodeList(nodeList, onteardown, name) {
    if(nodeList.nodeType !== undefined) {
        if(nodeList.nodeType === 11) {
            //
            this.nodes = childNodes(nodeList);
        } else {
            this.nodes = [nodeList];
        }
    } else if(canReflect.isListLike(nodeList)){
        this.nodes = canReflect.makeArray(nodeList);
    } else {
        throw new Error("You must pass an element ");
    }
    this.onteardown = onteardown;
    this.name = name;
    this.deepNodeLists = [];
    this.parentNodeList = null;
}

var domNodeToNodeList = new WeakMap();

canReflect.assignMap(NodeList.prototype, {
    teardown: function(isChild){
        var nodes = this.teardownChildren();

		// If an 'unregisted' function was provided during registration, remove
		// it from the list, and call the function provided.
		if (this.onteardown !== undefined) {
			var unregisteredCallback = nodeList.this.onteardown;
            // find the parent, and remove
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
    teardownChildren: function(isChild){
        var nodes = [];
		// For each node in the nodeList we want to compute it's id
		// and delete it from the nodeList's internal map.
		for (var n = 0; n < this.nodes.length; n++) {
			var node = this.nodes[n];
			// If the node does not have a nodeType it is an array of
			// nodes.
			if(node.nodeType !== undefined) {
				nodes.push(node);
			} else {
				// Recursively unregister each of the child lists in
				// the nodeList.
				push.apply(nodes,  node.teardown(true));
			}
		}

		var deepChildren = nodeList.deepChildren;
		if (deepChildren) {
			for (var l = 0; l < deepChildren.length; l++) {
				nodeLists.unregister(deepChildren[l], true);
			}
		}

		return nodes;
    },
    replaceImmediately: function(content){
        var frag = fragment(content);
        // see if any of the frag's elements are part of a nodeList
        this.nodes = [];
        var children = childNodes(frag),
            i = 0,
            len = children.length;
        while(i < len) {
            var child = children[i];
            var childNodeList = domNodeToNodeList.get(child);
            if(childNodeList !== undefined) {
                this.nodes.push(childNodeList);
                i += childNodeList.length;
            } else {
                this.nodes.push(child);
                i++;
            }
        }
    },
    replaceInDOMUIQueue: function(){

    },
    get length(){
        return this.nodes.length;
    }
});
