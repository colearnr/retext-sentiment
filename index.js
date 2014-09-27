var Retext = require('retext');
var sentiment = require('retext-sentiment');
var DOM = require('retext-dom');
var visit = require('retext-visit');

var inputElement = document.getElementsByTagName('textarea')[0];
var outputElement = document.getElementsByTagName('div')[0];

var retext = new Retext().use(sentiment).use(visit).use(DOM);

var currentDOMTree, currentTree;

function detectSentiment(value) {
    retext.parse(value, function (err, tree) {
        if (err) throw err;

        if (currentDOMTree) {
            currentDOMTree.parentNode.removeChild(currentDOMTree);
        }

        currentTree = tree;

        currentTree.visit(function (node) {
            var DOMNode;

            if (!node.DOMTagName || !node.data.polarity) {
                return
            }

            DOMNode = node.toDOMNode();

            DOMNode.setAttribute('data-polarity', node.data.polarity);
            DOMNode.setAttribute('data-valence', node.data.valence);
            DOMNode.className = node.type;
        });

        currentDOMTree = currentTree.toDOMNode();
        outputElement.appendChild(currentDOMTree);
    });
}

inputElement.addEventListener('input', function (event) {
    detectSentiment(inputElement.value);
});

detectSentiment(inputElement.value);

// function detectLanguage() {
//     visualiseResults(retext.parse(inputElement.value).data.languages);
// }
//
// function visualiseResults(results) {
//     wrapperElement.style.display = '';
//     cleanOutputElement();
//     results = results.map(createResult);
//
//     results.forEach(function (node) {
//         outputElement.appendChild(node);
//     });
// }
//
// function cleanOutputElement() {
//     while (outputElement.firstElementChild) {
//         outputElement.removeChild(outputElement.firstElementChild);
//     }
// }
//
// function createResult(result, n) {
//     var node = document.createElement('li');
//
//     node.textContent = result[0] + ': ' + result[1];
//
//     return node;
// }
// 
// detectLanguage();
