var NodeList = require('can-view-nodelist/node-list');

var fragment = require('can-util/dom/fragment/fragment');
var makeArray = require('can-util/js/make-array/make-array');
var frag = require('can-util/dom/frag/frag');

var QUnit = require('steal-qunit');

/*
<div>I
{{#person}}
  like:
  {{#each hobbies}}<span>{{.}}</span>{{/each}}.
  {{#if owner}}-{{{ownerStuff}}}-{{/if}}!
{{/person}}</div>
*/
test('unregisters child nodeLists', function () {


    var div = document.createElement("div"),
        ownerNodeList,
        actions = [],
        addAction = function(name){
            return function(){
                actions.push(name)
            };
        };
    div.appendChild( fragment(["I","PLACEHOLDER"]));


    // then the content gets created
    (function render_person(){
        var personNodeList = new NodeList([div.childNodes[1]], addAction("teardown-person"));

        var personFrag = fragment(["like: ","PLACEHOLDER",".","PLACEHOLDER","!"]);


        // First #if because can-view-target goes backwards
        (function render_if_owner(){
            ownerNodeList = new NodeList([personFrag.childNodes[3]], addAction("teardown-ifOwner")); // how does this know about its parent?

            var ownerFrag = fragment(["-","PLACEHOLDER","-"]);

            (function render_ownerStuff(){
                var ownerStuffNodeList = new NodeList(ownerFrag.childNodes[1], addAction("teardown-ownerStuff"));

                ownerStuffNodeList.replaceImmediately("<label>OWNERSTUFF</label>");
            })();

            ownerNodeList.replaceImmediately(ownerFrag); // going to need another kill then update

        })();

        // then #each hobbies
        (function render_hobbies(){
            var hobbiesNodeList = new NodeList([personFrag.childNodes[1]], addAction("teardown-each")); // how does this know about its parent?


            hobbiesNodeList.replaceImmediately("<span>First</span></span>Second</span>"); // going to need another kill then update

        })();


        personNodeList.replaceImmediately(frag);

    })();

    (function rerender_if_owner(){
        var ownerFrag = fragment(["-","PLACEHOLDER","-"]);

        (function render_ownerStuff(){
            var ownerStuffNodeList = new NodeList(ownerFrag.childNodes[1], addAction("teardown-ownerStuff2"));

            ownerStuffNodeList.replaceImmediately("<label>OWNERSTUFF2</label>");
        })();

        ownerNodeList.replaceInDOMUIQueue(ownerFrag); // going to need another kill then update

    })();


});
