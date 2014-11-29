/**
 * Dependencies.
 */

var Retext = require('wooorm/retext@0.4.0');
var sentiment = require('wooorm/retext-sentiment@0.2.0');
var dom = require('wooorm/retext-dom@0.2.3');
var visit = require('wooorm/retext-visit@0.2.2');

/**
 * Retext.
 */

var retext = new Retext()
    .use(dom)
    .use(visit)
    .use(sentiment);

/**
 * DOM elements.
 */

var $input = document.getElementsByTagName('textarea')[0];
var $output = document.getElementsByTagName('div')[0];

/**
 * Event handlers
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
                return
            }

            DOMNode = node.toDOMNode();

            DOMNode.setAttribute('data-polarity', node.data.polarity);
            DOMNode.setAttribute('data-valence', node.data.valence);
            DOMNode.className = node.type;
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
