/**
 * Dependencies.
 */

var Retext = require('wooorm/retext@0.5.0');
var sentiment = require('wooorm/retext-sentiment@0.4.2');
var emoji = require('wooorm/retext-emoji@0.5.4');
var dom = require('wooorm/retext-dom@0.3.2');
var visit = require('wooorm/retext-visit@0.2.5');

/**
 * Retext.
 */

var retext = new Retext()
    .use(dom)
    .use(emoji)
    .use(visit)
    .use(sentiment);

/**
 * DOM elements.
 */

var $input = document.getElementsByTagName('textarea')[0];
var $output = document.getElementsByTagName('div')[0];

/**
 * Make sure emoji are created as DOM elements.
 */

retext.TextOM.EmoticonNode.prototype.DOMTagName = 'span';

/**
 * Event handlers.
 */

var tree;

function oninputchange() {
    if (tree) {
        tree.toDOMNode().parentNode.removeChild(tree.toDOMNode());
    }

    retext.parse($input.value, function (err, root) {
        if (err) throw err;

        tree = root;

        tree.visit(function (node) {
            var DOMNode;

            if (!node.DOMTagName || !node.data.polarity) {
                return;
            }

            console.log(node, node.toString(), node.data.polarity);

            DOMNode = node.toDOMNode();

            DOMNode.setAttribute('data-polarity', node.data.polarity);
            DOMNode.setAttribute('data-valence', node.data.valence);
            DOMNode.className = node.type + ' ' + node.nodeName;
        });

        $output.appendChild(tree.toDOMNode());
    });
}

/**
 * Attach event handlers.
 */

$input.addEventListener('input', oninputchange);

/**
 * Provide initial answer.
 */

oninputchange();
