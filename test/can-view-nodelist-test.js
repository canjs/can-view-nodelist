var nodeLists = require('can-view-nodelist');

var fragment = require('can-fragment');
var canReflect = require('can-reflect');

var QUnit = require('steal-qunit');

QUnit.module('can-view-nodelist');

QUnit.test('unregisters child nodeLists', function(assert) {
	assert.expect(4);
	// two spans that might have been created by #each
	var spansFrag = fragment("<span>1</span><span>2</span>");
	var spansList = canReflect.toArray(spansFrag.childNodes);

	nodeLists.register(spansList, function(){
		assert.ok(true,"unregistered spansList");
	});


	// A label that might have been created by #foo
	var labelFrag = fragment("<label>l</label>");
	var labelList = canReflect.toArray(labelFrag.childNodes);

	nodeLists.register( labelList, function(){
		assert.ok(true,"unregistered labelList");
	});

	// the html inside #if}
	var ifPreHookupFrag = fragment(["~","","-",""]),
		ifChildNodes = ifPreHookupFrag.childNodes,
		ifEls = canReflect.toArray(ifChildNodes);


	nodeLists.replace([ifChildNodes[1]], spansFrag);

	// 4 because 2 elements are inserted, and ifChildNodes is live
	nodeLists.replace([ifChildNodes[4]], labelFrag);

	var ifList = canReflect.toArray(ifPreHookupFrag.childNodes);

	nodeLists.register(ifList, function(){
		assert.ok(true,"unregistered ifList");
	});

	assert.deepEqual(ifList,[
		ifEls[0],
		spansList,
		ifEls[2],
		labelList
	]);


	nodeLists.update(ifList, [document.createTextNode("empty")]);


	assert.ok(labelList.isUnregistered, "labelList was unregistered");
});

QUnit.test(".remove doesn't remove elements not in the parent", function(assert) {
	var notIn = document.createTextNode("test");

	var parent = document.createElement("div");
	parent.appendChild(document.createElement("span"));
	parent.appendChild(document.createElement("section"));

	try {
		nodeLists.remove([parent.firstChild, notIn, parent.firstChild.nextSibling]);

		assert.equal(parent.firstChild, null, "No children now");
	} catch(err) {
		assert.ok(false, err);
	}
});
