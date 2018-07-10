var nodeLists = require('can-view-nodelist');

var fragment = require('can-fragment');
var canReflect = require('can-reflect');

var QUnit = require('steal-qunit');

QUnit.module('can-view-nodelist');

test('unregisters child nodeLists', function () {
	expect(4);
	// two spans that might have been created by #each
	var spansFrag = fragment("<span>1</span><span>2</span>");
	var spansList = canReflect.toArray(spansFrag.childNodes);

	nodeLists.register(spansList, function(){
		ok(true,"unregistered spansList");
	});


	// A label that might have been created by #foo
	var labelFrag = fragment("<label>l</label>");
	var labelList = canReflect.toArray(labelFrag.childNodes);

	nodeLists.register( labelList, function(){
		ok(true,"unregistered labelList");
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
		ok(true,"unregistered ifList");
	});

	deepEqual(ifList,[
		ifEls[0],
		spansList,
		ifEls[2],
		labelList
	]);


	nodeLists.update(ifList, [document.createTextNode("empty")]);


	QUnit.ok(labelList.isUnregistered, "labelList was unregistered");
});

test('unregisters newDeepChildren', function () {
	expect(3);

	var list1 = [];
	var list2 = [
		document.createTextNode("1"),
		document.createTextNode("2")
	];

	nodeLists.register( list1, null, true );
	nodeLists.register( list2, function() {
		ok(true, "unregistered list2");
	}, list1 );

	QUnit.equal(list1.newDeepChildren[0].length, 2, "correct number of newDeepChildren");

	nodeLists.update(list1, [document.createTextNode("3")]);

	QUnit.ok(list2.isUnregistered, "list2 was unregistered");
});
