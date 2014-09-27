/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("wooorm~parse-latin@0.1.3", function (exports, module) {
/**!
 * parse-latin
 *
 * Licensed under MIT.
 * Copyright (c) 2014 Titus Wormer <tituswormer@gmail.com>
 */
'use strict';

var EXPRESSION_ABBREVIATION_PREFIX, EXPRESSION_NEW_LINE,
    EXPRESSION_MULTI_NEW_LINE,
    EXPRESSION_AFFIX_PUNCTUATION, EXPRESSION_INNER_WORD_PUNCTUATION,
    EXPRESSION_INITIAL_WORD_PUNCTUATION, EXPRESSION_FINAL_WORD_PUNCTUATION,
    EXPRESSION_LOWER_INITIAL_EXCEPTION,
    EXPRESSION_NUMERICAL, EXPRESSION_TERMINAL_MARKER,
    GROUP_ALPHABETIC, GROUP_ASTRAL, GROUP_CLOSING_PUNCTUATION,
    GROUP_COMBINING_DIACRITICAL_MARK, GROUP_COMBINING_NONSPACING_MARK,
    GROUP_FINAL_PUNCTUATION, GROUP_LETTER_LOWER, GROUP_NUMERICAL,
    GROUP_TERMINAL_MARKER, GROUP_WHITE_SPACE, GROUP_WORD,
    parseLatinPrototype;

/**
 * Expands a list of Unicode code points and ranges to be usable in an
 * expression.
 *
 * "Borrowed" from XRegexp.
 *
 * @param {string} value
 * @return {string}
 * @private
 */
function expand(value) {
    return value.replace(/\w{4}/g, '\\u$&');
}

/**
 * Expose Unicode Number Range (Nd, Nl, and No).
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_NUMERICAL = expand(
    /*
     * Nd: Number, Decimal Digit
     */
    '0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F' +
    '09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0B72-0B770BE6-0BF' +
    '20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F33' +
    '1040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-1819' +
    '1946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C49' +
    '1C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-' +
    '24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293248-324F' +
    '3251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9' +
    'A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19' +

    /*
     * Nl: Number, Letter
     */
    '16EE-16F02160-21822185-218830073021-30293038-303AA6E6-A6EF' +

    /*
     * No: Number, Other
     */
    '00B200B300B900BC-00BE09F4-09F90B72-0B770BF0-0BF20C78-0C7E0D70-0D75' +
    '0F2A-0F331369-137C17F0-17F919DA20702074-20792080-20892150-215F' +
    '21892460-249B24EA-24FF2776-27932CFD3192-31953220-32293248-324F' +
    '3251-325F3280-328932B1-32BFA830-A835'
);

/**
 * Expose Unicode Alphabetic category Ll (Letter, lowercase).
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_LETTER_LOWER = expand('0061-007A00B500DF-00F600F8-00FF010101030105' +
    '01070109010B010D010F01110113011501170119011B011D011F0121012301250127' +
    '0129012B012D012F01310133013501370138013A013C013E01400142014401460148' +
    '0149014B014D014F01510153015501570159015B015D015F01610163016501670169' +
    '016B016D016F0171017301750177017A017C017E-0180018301850188018C018D0192' +
    '01950199-019B019E01A101A301A501A801AA01AB01AD01B001B401B601B901BA01BD-' +
    '01BF01C601C901CC01CE01D001D201D401D601D801DA01DC01DD01DF01E101E301E5' +
    '01E701E901EB01ED01EF01F001F301F501F901FB01FD01FF02010203020502070209' +
    '020B020D020F02110213021502170219021B021D021F02210223022502270229022B' +
    '022D022F02310233-0239023C023F0240024202470249024B024D024F-02930295-' +
    '02AF037103730377037B-037D039003AC-03CE03D003D103D5-03D703D903DB03DD' +
    '03DF03E103E303E503E703E903EB03ED03EF-03F303F503F803FB03FC0430-045F0461' +
    '0463046504670469046B046D046F04710473047504770479047B047D047F0481048B' +
    '048D048F04910493049504970499049B049D049F04A104A304A504A704A904AB04AD' +
    '04AF04B104B304B504B704B904BB04BD04BF04C204C404C604C804CA04CC04CE04CF' +
    '04D104D304D504D704D904DB04DD04DF04E104E304E504E704E904EB04ED04EF04F1' +
    '04F304F504F704F904FB04FD04FF05010503050505070509050B050D050F05110513' +
    '051505170519051B051D051F05210523052505270561-05871D00-1D2B1D6B-1D77' +
    '1D79-1D9A1E011E031E051E071E091E0B1E0D1E0F1E111E131E151E171E191E1B1E1D' +
    '1E1F1E211E231E251E271E291E2B1E2D1E2F1E311E331E351E371E391E3B1E3D1E3F' +
    '1E411E431E451E471E491E4B1E4D1E4F1E511E531E551E571E591E5B1E5D1E5F1E61' +
    '1E631E651E671E691E6B1E6D1E6F1E711E731E751E771E791E7B1E7D1E7F1E811E83' +
    '1E851E871E891E8B1E8D1E8F1E911E931E95-1E9D1E9F1EA11EA31EA51EA71EA91EAB' +
    '1EAD1EAF1EB11EB31EB51EB71EB91EBB1EBD1EBF1EC11EC31EC51EC71EC91ECB1ECD' +
    '1ECF1ED11ED31ED51ED71ED91EDB1EDD1EDF1EE11EE31EE51EE71EE91EEB1EED1EEF' +
    '1EF11EF31EF51EF71EF91EFB1EFD1EFF-1F071F10-1F151F20-1F271F30-1F371F40-' +
    '1F451F50-1F571F60-1F671F70-1F7D1F80-1F871F90-1F971FA0-1FA71FB0-1FB4' +
    '1FB61FB71FBE1FC2-1FC41FC61FC71FD0-1FD31FD61FD71FE0-1FE71FF2-1FF41FF6' +
    '1FF7210A210E210F2113212F21342139213C213D2146-2149214E21842C30-2C5E2C61' +
    '2C652C662C682C6A2C6C2C712C732C742C76-2C7B2C812C832C852C872C892C8B2C8D' +
    '2C8F2C912C932C952C972C992C9B2C9D2C9F2CA12CA32CA52CA72CA92CAB2CAD2CAF' +
    '2CB12CB32CB52CB72CB92CBB2CBD2CBF2CC12CC32CC52CC72CC92CCB2CCD2CCF2CD1' +
    '2CD32CD52CD72CD92CDB2CDD2CDF2CE12CE32CE42CEC2CEE2CF32D00-2D252D272D2D' +
    'A641A643A645A647A649A64BA64DA64FA651A653A655A657A659A65BA65DA65FA661' +
    'A663A665A667A669A66BA66DA681A683A685A687A689A68BA68DA68FA691A693A695' +
    'A697A723A725A727A729A72BA72DA72F-A731A733A735A737A739A73BA73DA73FA741' +
    'A743A745A747A749A74BA74DA74FA751A753A755A757A759A75BA75DA75FA761A763' +
    'A765A767A769A76BA76DA76FA771-A778A77AA77CA77FA781A783A785A787A78CA78E' +
    'A791A793A7A1A7A3A7A5A7A7A7A9A7FAFB00-FB06FB13-FB17FF41-FF5A'
);

/**
 * Expose Unicode Alphabetic Range: Contains Lu (Letter, uppercase),
 * Ll (Letter, lowercase), and Lo (Letter, other).
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_ALPHABETIC = expand('0041-005A0061-007A00AA00B500BA00C0-00D6' +
    '00D8-00F600F8-02C102C6-02D102E0-02E402EC02EE03450370-037403760377' +
    '037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-0527' +
    '0531-055605590561-058705B0-05BD05BF05C105C205C405C505C705D0-05EA' +
    '05F0-05F20610-061A0620-06570659-065F066E-06D306D5-06DC06E1-06E8' +
    '06ED-06EF06FA-06FC06FF0710-073F074D-07B107CA-07EA07F407F507FA0800-' +
    '0817081A-082C0840-085808A008A2-08AC08E4-08E908F0-08FE0900-093B' +
    '093D-094C094E-09500955-09630971-09770979-097F0981-09830985-098C' +
    '098F09900993-09A809AA-09B009B209B6-09B909BD-09C409C709C809CB09CC' +
    '09CE09D709DC09DD09DF-09E309F009F10A01-0A030A05-0A0A0A0F0A100A13-' +
    '0A280A2A-0A300A320A330A350A360A380A390A3E-0A420A470A480A4B0A4C0A51' +
    '0A59-0A5C0A5E0A70-0A750A81-0A830A85-0A8D0A8F-0A910A93-0AA80AAA-' +
    '0AB00AB20AB30AB5-0AB90ABD-0AC50AC7-0AC90ACB0ACC0AD00AE0-0AE30B01-' +
    '0B030B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D-0B44' +
    '0B470B480B4B0B4C0B560B570B5C0B5D0B5F-0B630B710B820B830B85-0B8A0B8E' +
    '-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BBE-' +
    '0BC20BC6-0BC80BCA-0BCC0BD00BD70C01-0C030C05-0C0C0C0E-0C100C12-0C28' +
    '0C2A-0C330C35-0C390C3D-0C440C46-0C480C4A-0C4C0C550C560C580C590C60-' +
    '0C630C820C830C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD-0CC4' +
    '0CC6-0CC80CCA-0CCC0CD50CD60CDE0CE0-0CE30CF10CF20D020D030D05-0D0C' +
    '0D0E-0D100D12-0D3A0D3D-0D440D46-0D480D4A-0D4C0D4E0D570D60-0D63' +
    '0D7A-0D7F0D820D830D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60DCF-0DD4' +
    '0DD60DD8-0DDF0DF20DF30E01-0E3A0E40-0E460E4D0E810E820E840E870E88' +
    '0E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB90EBB-' +
    '0EBD0EC0-0EC40EC60ECD0EDC-0EDF0F000F40-0F470F49-0F6C0F71-0F810F88-' +
    '0F970F99-0FBC1000-10361038103B-103F1050-10621065-1068106E-1086108E' +
    '109C109D10A0-10C510C710CD10D0-10FA10FC-1248124A-124D1250-12561258' +
    '125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-' +
    '12C512C8-12D612D8-13101312-13151318-135A135F1380-138F13A0-13F4' +
    '1401-166C166F-167F1681-169A16A0-16EA16EE-16F01700-170C170E-1713' +
    '1720-17331740-17531760-176C176E-1770177217731780-17B317B6-17C817D' +
    '717DC1820-18771880-18AA18B0-18F51900-191C1920-192B1930-19381950-' +
    '196D1970-19741980-19AB19B0-19C91A00-1A1B1A20-1A5E1A61-1A741AA71B00' +
    '-1B331B35-1B431B45-1B4B1B80-1BA91BAC-1BAF1BBA-1BE51BE7-1BF11C00-' +
    '1C351C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF31CF51CF61D00-1DBF1E00-1F15' +
    '1F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB4' +
    '1FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-' +
    '1FF41FF6-1FFC2071207F2090-209C21022107210A-211321152119-211D2124' +
    '21262128212A-212D212F-2139213C-213F2145-2149214E2160-218824B6-' +
    '24E92C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2CF22CF32D00-2D252D272D2D' +
    '2D30-2D672D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-' +
    '2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2DE0-2DFF2E2F3005-30073021-30293031' +
    '-30353038-303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-' +
    '318E31A0-31BA31F0-31FF3400-4DB54E00-9FCCA000-A48CA4D0-A4FDA500-' +
    'A60CA610-A61FA62AA62BA640-A66EA674-A67BA67F-A697A69F-A6EFA717-A71F' +
    'A722-A788A78B-A78EA790-A793A7A0-A7AAA7F8-A801A803-A805A807-A80A' +
    'A80C-A827A840-A873A880-A8C3A8F2-A8F7A8FBA90A-A92AA930-A952A960-' +
    'A97CA980-A9B2A9B4-A9BFA9CFAA00-AA36AA40-AA4DAA60-AA76AA7AAA80-' +
    'AABEAAC0AAC2AADB-AADDAAE0-AAEFAAF2-AAF5AB01-AB06AB09-AB0EAB11-' +
    'AB16AB20-AB26AB28-AB2EABC0-ABEAAC00-D7A3D7B0-D7C6D7CB-D7FBF900-' +
    'FA6DFA70-FAD9FB00-FB06FB13-FB17FB1D-FB28FB2A-FB36FB38-FB3CFB3EFB40' +
    'FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74' +
    'FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7' +
    'FFDA-FFDC'
);

/**
 * Expose Unicode White Space Range.
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_WHITE_SPACE = expand(
    '0009-000D0020008500A01680180E2000-200A20282029202F205F3000'
);

/**
 * Expose Unicode Combining Diacritical Marks, and Combining Diacritical
 * Marks for Symbols, Blocks.
 *
 * @global
 * @private
 * @constant
 */
GROUP_COMBINING_DIACRITICAL_MARK = expand('20D0-20FF0300-036F');

/**
 * Expose Unicode Mark, Nonspacing Block.
 *
 * @global
 * @private
 * @constant
 */
GROUP_COMBINING_NONSPACING_MARK = expand('0300-036F0483-04870591-05BD' +
    '05BF05C105C205C405C505C70610-061A064B-065F067006D6-06DC06DF-06E4' +
    '06E706E806EA-06ED07110730-074A07A6-07B007EB-07F30816-0819081B-0823' +
    '0825-08270829-082D0859-085B08E4-08FE0900-0902093A093C0941-0948094D' +
    '0951-095709620963098109BC09C1-09C409CD09E209E30A010A020A3C0A410A42' +
    '0A470A480A4B-0A4D0A510A700A710A750A810A820ABC0AC1-0AC50AC70AC80ACD' +
    '0AE20AE30B010B3C0B3F0B41-0B440B4D0B560B620B630B820BC00BCD0C3E-0C40' +
    '0C46-0C480C4A-0C4D0C550C560C620C630CBC0CBF0CC60CCC0CCD0CE20CE30D41' +
    '-0D440D4D0D620D630DCA0DD2-0DD40DD60E310E34-0E3A0E47-0E4E0EB10EB4-' +
    '0EB90EBB0EBC0EC8-0ECD0F180F190F350F370F390F71-0F7E0F80-0F840F86' +
    '0F870F8D-0F970F99-0FBC0FC6102D-10301032-10371039103A103D103E1058' +
    '1059105E-10601071-1074108210851086108D109D135D-135F1712-17141732-' +
    '1734175217531772177317B417B517B7-17BD17C617C9-17D317DD180B-180D' +
    '18A91920-19221927192819321939-193B1A171A181A561A58-1A5E1A601A62' +
    '1A65-1A6C1A73-1A7C1A7F1B00-1B031B341B36-1B3A1B3C1B421B6B-1B731B80' +
    '1B811BA2-1BA51BA81BA91BAB1BE61BE81BE91BED1BEF-1BF11C2C-1C331C36' +
    '1C371CD0-1CD21CD4-1CE01CE2-1CE81CED1CF41DC0-1DE61DFC-1DFF20D0-20DC' +
    '20E120E5-20F02CEF-2CF12D7F2DE0-2DFF302A-302D3099309AA66FA674-A67D' +
    'A69FA6F0A6F1A802A806A80BA825A826A8C4A8E0-A8F1A926-A92DA947-A951' +
    'A980-A982A9B3A9B6-A9B9A9BCAA29-AA2EAA31AA32AA35AA36AA43AA4CAAB0' +
    'AAB2-AAB4AAB7AAB8AABEAABFAAC1AAECAAEDAAF6ABE5ABE8ABEDFB1EFE00-FE0F' +
    'FE20-FE26'
);

/**
 * Expose word characters. Includes Unicode:
 *
 * - Number Range (Nd, Nl, and No);
 * - Alphabetic Range (Lu, Ll, and Lo);
 * - Combining Diacritical Marks block;
 * - Combining Diacritical Marks for Symbols block;
 *
 * @global
 * @private
 * @constant
 */
GROUP_WORD = GROUP_NUMERICAL + GROUP_ALPHABETIC +
    GROUP_COMBINING_DIACRITICAL_MARK + GROUP_COMBINING_NONSPACING_MARK;

/**
 * Expose Unicode Cs (Other, Surrogate) category.
 *
 * @global
 * @private
 * @constant
 */
GROUP_ASTRAL = expand('D800-DBFFDC00-DFFF');

/**
 * Expose interrobang, question-, and exclamation mark.
 *
 * - Full stop;
 * - Interrobang;
 * - Question mark;
 * - Exclamation mark;
 * - Horizontal ellipsis.
 *
 * @global
 * @private
 * @constant
 */
GROUP_TERMINAL_MARKER = '\\.\\u203D?!\\u2026';

/**
 * Expose Unicode Pe (Punctuation, Close) category.
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_CLOSING_PUNCTUATION = expand('0029005D007D0F3B0F3D169C2046' +
    '207E208E232A2769276B276D276F27712773277527C627E727E927EB27ED27EF' +
    '298429862988298A298C298E2990299229942996299829D929DB29FD2E232E25' +
    '2E272E293009300B300D300F3011301530173019301B301E301FFD3FFE18FE36' +
    'FE38FE3AFE3CFE3EFE40FE42FE44FE48FE5AFE5CFE5EFF09FF3DFF5DFF60FF63'
);

/**
 * Expose Unicode Pf (Punctuation, Final) category.
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_FINAL_PUNCTUATION = expand('00BB2019201D203A2E032E052E0A2E0D2E1D2E21');

/**
 * A blacklist of full stop characters that should not be treated as
 * terminal sentence markers:
 *
 * - A "word" boundry,
 * - followed by a case-insensitive abbreviation,
 * - followed by full stop.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_ABBREVIATION_PREFIX = new RegExp(
    '^(' +
        '[0-9]+|' +
        '[a-z]|' +
        /*
         * Common Latin Abbreviations:
         * Based on: http://en.wikipedia.org/wiki/List_of_Latin_abbreviations
         * Where only the abbreviations written without joining full stops,
         * but with a final full stop, were extracted.
         *
         * circa, capitulus, confer, compare, centum weight, eadem, (et) alii,
         * et cetera, floruit, foliis, ibidem, idem, nemine && contradicente,
         * opere && citato, (per) cent, (per) procurationem, (pro) tempore,
         * sic erat scriptum, (et) sequentia, statim, videlicet.
         */
        'ca|cap|cca|cf|cp|cwt|ead|al|etc|fl|ff|ibid|id|nem|con|op|cit|cent|' +
        'pro|tem|sic|seq|stat|viz' +
    ')$'
);

/**
 * Matches closing or final punctuation, or terminal markers that should
 * still be included in the previous sentence, even though they follow
 * the sentence's terminal marker.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_AFFIX_PUNCTUATION = new RegExp(
    '^([' +
        GROUP_CLOSING_PUNCTUATION +
        GROUP_FINAL_PUNCTUATION +
        GROUP_TERMINAL_MARKER +
        '"\'' +
    '])\\1*$'
);

/**
 * Matches a string consisting of one or more new line characters.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_NEW_LINE = /^(\r?\n|\r)+$/;

/**
 * Matches a string consisting of two or more new line characters.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_MULTI_NEW_LINE = /^(\r?\n|\r){2,}$/;

/**
 * Matches a sentence terminal marker, one or more of the following:
 *
 * - Full stop;
 * - Interrobang;
 * - Question mark;
 * - Exclamation mark;
 * - Horizontal ellipsis.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_TERMINAL_MARKER = new RegExp(
    '^([' + GROUP_TERMINAL_MARKER + ']+)$'
);

/**
 * Matches punctuation part of the surrounding words.
 *
 * Includes:
 * - Hyphen-minus;
 * - At sign;
 * - Question mark;
 * - Equals sign;
 * - full-stop;
 * - colon;
 * - Dumb single quote;
 * - Right single quote;
 * - Ampersand;
 * - Soft hyphen;
 * - Hyphen;
 * - Non-breaking hyphen;
 * - Hyphenation point;
 * - Middle dot;
 * - Slash (one or more);
 * - Underscore (one or more).
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_INNER_WORD_PUNCTUATION =
    /^([-@?=.:'\u2019&\u00AD\u00B7\u2010\2011\u2027]|[_\/]+)$/;

/**
 * Matches punctuation part of the next word.
 *
 * Includes:
 * - Ampersand;
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_INITIAL_WORD_PUNCTUATION = /^&$/;

/**
 * Matches punctuation part of the previous word.
 *
 * Includes:
 * - Hyphen-minus.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_FINAL_WORD_PUNCTUATION = /^-$/;

/**
 * Matches a number.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_NUMERICAL = new RegExp('^[' + GROUP_NUMERICAL + ']+$');

/**
 * Matches an initial lower case letter.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_LOWER_INITIAL_EXCEPTION = new RegExp(
    '^[' +
        GROUP_LETTER_LOWER +
    ']'
);

/**
 * Apply modifiers on a token.
 *
 * @param {Array.<Function>} modifiers
 * @param {Object} parent
 * @global
 * @private
 */
function modify(modifiers, parent) {
    var length = modifiers.length,
        iterator = -1,
        modifier, pointer, result, children;

    /* Iterate over all modifiers... */
    while (++iterator < length) {
        modifier = modifiers[iterator];
        pointer = -1;

        /*
         * We allow conditional assignment here, because the length of the
         * parent's children will probably change.
         */
        children = parent.children;

        /* Iterate over all children... */
        while (children[++pointer]) {
            result = modifier(children[pointer], pointer, parent);

            /*
             * If the modifier returns a number, move the pointer over to
             * that child.
             */
            if (typeof result === 'number') {
                pointer = result - 1;
            }
        }
    }
}

/**
 * Returns the value of all `TextNode` tokens inside a given token.
 *
 * @param {Object} token
 * @return {string} - The stringified token.
 * @global
 * @private
 */
function tokenToString(token) {
    var value = '',
        iterator, children;

    if (token.value) {
        return token.value;
    }

    iterator = -1;
    children = token.children;

    /* Shortcut: This is pretty common, and a small performance win. */
    if (children.length === 1 && children[0].type === 'TextNode') {
        return children[0].value;
    }

    while (children[++iterator]) {
        value += tokenToString(children[iterator]);
    }

    return value;
}

/**
 * Creates a (modifiable) tokenizer.
 *
 * @param {Object} context               - The class to attach to.
 * @param {Object} options               - The settings to use.
 * @param {string} options.name          - The name of the method.
 * @param {string} options.type          - The type of parent node to create.
 * @param {string} options.tokenizer     - The property where the child
 *                                         tokenizer lives
 * @param {Array.<Function>} options.modifiers - The initial modifiers to
 *                                         apply on each parse.
 * @param {RegExp} options.delimiter     - The delimiter to break children at.
 * @return {Function} - The tokenizer.
 * @global
 * @private
 */
function tokenizerFactory(context, options) {
    var name = options.name;

    context.prototype[name + 'Modifiers'] = options.modifiers;
    context.prototype[name + 'Delimiter'] = options.delimiter;

    return function (value) {
        var delimiter = this[name + 'Delimiter'],
            lastIndex, children, iterator, length, root, start, stem, tokens;

        root = {
            'type' : options.type,
            'children' : []
        };

        children = root.children;

        stem = this[options.tokenizer](value);
        tokens = stem.children;

        length = tokens.length;
        lastIndex = length - 1;
        iterator = -1;
        start = 0;

        while (++iterator < length) {
            if (
                iterator !== lastIndex &&
                !delimiter.test(tokenToString(tokens[iterator]))
            ) {
                continue;
            }

            children.push({
                'type' : stem.type,
                'children' : tokens.slice(start, iterator + 1)
            });

            start = iterator + 1;
        }

        modify(this[name + 'Modifiers'], root);

        return root;
    };
}

/**
 * Merges certain punctuation marks into their previous words.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeInitialWordPunctuation(child, index, parent) {
    var children, next, hasPreviousWord, hasNextWord;

    if (
        child.type !== 'PunctuationNode' ||
        !EXPRESSION_INITIAL_WORD_PUNCTUATION.test(tokenToString(child))
    ) {
        return;
    }

    children = parent.children;
    next = children[index + 1];

    hasPreviousWord = index !== 0 && children[index - 1].type === 'WordNode';
    hasNextWord = next && next.type === 'WordNode';

    if (hasPreviousWord || !hasNextWord) {
        return;
    }

    /* Remove `child` from parent. */
    children.splice(index, 1);

    /* Add the punctuation mark at the start of the next node. */
    next.children.unshift(child);

    /* Next, iterate over the node at the previous position. */
    return index - 1;
}

/**
 * Merges certain punctuation marks into their preceding words.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeFinalWordPunctuation(child, index, parent) {
    var children, prev, next;

    if (
        index === 0 ||
        child.type !== 'PunctuationNode' ||
        !EXPRESSION_FINAL_WORD_PUNCTUATION.test(tokenToString(child))
    ) {
        return;
    }

    children = parent.children;
    prev = children[index - 1];
    next = children[index + 1];

    if (
        (next && next.type === 'WordNode') ||
        !(prev && prev.type === 'WordNode')
    ) {
        return;
    }

    /* Remove `child` from parent. */
    children.splice(index, 1);

    /* Add the punctuation mark at the end of the previous node. */
    prev.children.push(child);

    /* Next, iterate over the node *now* at the current position (which was
     * the next node). */
    return index;
}

/**
 * Merges two words surrounding certain punctuation marks.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeInnerWordPunctuation(child, index, parent) {
    var children, prev, otherChild,
        iterator, tokens, queue;

    if (index === 0 || child.type !== 'PunctuationNode') {
        return;
    }

    children = parent.children;
    prev = children[index - 1];

    if (!prev || prev.type !== 'WordNode') {
        return;
    }

    iterator = index - 1;
    tokens = [];
    queue = [];

    /*
     * - Is a token which is neither word nor inner word punctuation is
     *   found, the loop is broken.
     * - If a inner word punctuation mark is found, it's queued.
     * - If a word is found, it's queued (and the queue stored and emptied).
     */
    while (children[++iterator]) {
        otherChild = children[iterator];

        if (otherChild.type === 'WordNode') {
            tokens = tokens.concat(queue, otherChild.children);
            queue = [];
            continue;
        }

        if (
            otherChild.type === 'PunctuationNode' &&
            EXPRESSION_INNER_WORD_PUNCTUATION.test(tokenToString(otherChild))
        ) {
            queue.push(otherChild);
            continue;
        }

        break;
    }

    /* If no tokens were found, exit. */
    if (!tokens.length) {
        return;
    }

    /* If there was a queue found, remove its length from iterator. */
    if (queue.length) {
        iterator -= queue.length;
    }

    /* Remove every (one or more) inner-word punctuation marks, and children
     * of words. */
    children.splice(index, iterator - index);

    /* Add all found tokens to prev.children */
    prev.children = prev.children.concat(tokens);

    return index;
}

/**
 * Merges initialisms.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeInitialisms(child, index, parent) {
    var prev, children, length, iterator, otherChild, isAllDigits, value;

    if (
        index === 0 || child.type !== 'PunctuationNode' ||
        tokenToString(child) !== '.'
    ) {
        return;
    }

    prev = parent.children[index - 1];
    children = prev.children;

    /* istanbul ignore else: TOSPEC: Currently not spec-able, but
     * future-friendly */
    if (children) {
        length = children.length;
    } else {
        length = 0;
    }

    if (prev.type !== 'WordNode' || length < 2 || length % 2 === 0) {
        return;
    }

    iterator = length;
    isAllDigits = true;

    while (children[--iterator]) {
        otherChild = children[iterator];
        value = tokenToString(otherChild);

        if (iterator % 2 === 0) {
            /* istanbul ignore if: TOSPEC: Currently not spec-able, but
             * future-friendly */
            if (otherChild.type !== 'TextNode') {
                return;
            }

            if (value.length > 1) {
                return;
            }

            if (!EXPRESSION_NUMERICAL.test(value)) {
                isAllDigits = false;
            }
        } else if (otherChild.type !== 'PunctuationNode' || value !== '.') {
            /* istanbul ignore else: TOSPEC */
            if (iterator < length - 2) {
                break;
            } else {
                return;
            }
        }
    }

    if (isAllDigits) {
        return;
    }

    /* Remove `child` from parent. */
    parent.children.splice(index, 1);

    /* Add child to the previous children. */
    children.push(child);
}

/**
 * Merges a sentence into its next sentence, when the sentence ends with
 * a certain word.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergePrefixExceptions(child, index, parent) {
    var children = child.children,
        node;

    if (
        !children ||
        !children.length ||
        index === parent.children.length - 1
    ) {
        return;
    }

    node = children[children.length - 1];

    if (
        !node || node.type !== 'PunctuationNode' ||
        tokenToString(node) !== '.'
    ) {
        return;
    }

    node = children[children.length - 2];

    if (!node ||
        node.type !== 'WordNode' ||
        !EXPRESSION_ABBREVIATION_PREFIX.test(
            tokenToString(node).toLowerCase()
        )
    ) {
        return;
    }

    child.children = children.concat(
        parent.children[index + 1].children
    );

    parent.children.splice(index + 1, 1);

    return index - 1;
}

/**
 * Merges a sentence into its previous sentence, when the sentence starts
 * with a comma.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeAffixExceptions(child, index, parent) {
    var children = child.children,
        node, iterator, previousChild;

    if (!children || !children.length || index === 0) {
        return;
    }

    iterator = -1;

    while (children[++iterator]) {
        node = children[iterator];

        if (node.type === 'WordNode') {
            return;
        }

        if (node.type === 'PunctuationNode') {
            break;
        }
    }

    if (
        !node ||
        node.type !== 'PunctuationNode' ||
        !(tokenToString(node) === ',' || tokenToString(node) === ';')
    ) {
        return;
    }

    previousChild = parent.children[index - 1];

    previousChild.children = previousChild.children.concat(
        children
    );

    parent.children.splice(index, 1);

    return index - 1;
}

/**
 * Moves white space starting a sentence up, so they are the siblings
 * of sentences.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function makeInitialWhiteSpaceAndSourceSiblings(child, index, parent) {
    var children = child.children;

    if (
        !children ||
        !children.length ||
        (
            children[0].type !== 'WhiteSpaceNode' &&
            children[0].type !== 'SourceNode'
        )
    ) {
        return;
    }

    parent.children.splice(index, 0, children.shift());
}

/**
 * Moves white space ending a paragraph up, so they are the siblings
 * of paragraphs.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function makeFinalWhiteSpaceAndSourceSiblings(child, index, parent) {
    var children = child.children;

    if (
        !children ||
        children.length < 1 ||
        (
            children[children.length - 1].type !== 'WhiteSpaceNode' &&
            children[children.length - 1].type !== 'SourceNode'
        )
    ) {
        return;
    }

    parent.children.splice(index + 1, 0, child.children.pop());
}

/**
 * Merges non-terminal marker full stops into, if available, the previous
 * word, or if available, the next word.
 *
 * @param {Object} child
 * @param {number} index
 * @return {undefined}
 *
 * @global
 * @private
 */
function mergeRemainingFullStops(child, index) {
    var children = child.children,
        iterator = children.length,
        grandchild, prev, next, hasFoundDelimiter;

    hasFoundDelimiter = false;

    while (children[--iterator]) {
        grandchild = children[iterator];

        if (grandchild.type !== 'PunctuationNode') {
            /* This is a sentence without terminal marker, so we 'fool' the
             * code to make it think we have found one. */
            if (grandchild.type === 'WordNode') {
                hasFoundDelimiter = true;
            }
            continue;
        }

        /* Exit when this token is not a terminal marker. */
        if (!EXPRESSION_TERMINAL_MARKER.test(tokenToString(grandchild))) {
            continue;
        }

        /* Exit when this is the first terminal marker found (starting at the
         * end), so it should not be merged. */
        if (!hasFoundDelimiter) {
            hasFoundDelimiter = true;
            continue;
        }

        /* Only merge a single full stop. */
        if (tokenToString(grandchild) !== '.') {
            continue;
        }

        prev = children[iterator - 1];
        next = children[iterator + 1];

        if (prev && prev.type === 'WordNode') {
            /* Exit when the full stop is followed by a space and another,
             * full stop, such as: `{.} .` */
            if (
                next && next.type === 'WhiteSpaceNode' &&
                children[iterator + 2] &&
                children[iterator + 2].type === 'PunctuationNode' &&
                tokenToString(children[iterator + 2]) === '.'
            ) {
                continue;
            }

            /* Remove `child` from parent. */
            children.splice(iterator, 1);

            /* Add the punctuation mark at the end of the previous node. */
            prev.children.push(grandchild);

            iterator--;
        } else if (next && next.type === 'WordNode') {
            /* Remove `child` from parent. */
            children.splice(iterator, 1);

            /* Add the punctuation mark at the start of the next node. */
            next.children.unshift(grandchild);
        }
    }
}

/**
 * Breaks a sentence if a node containing two or more white spaces is found.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function breakImplicitSentences(child, index, parent) {
    if (child.type !== 'SentenceNode') {
        return;
    }

    var children = child.children,
        iterator = -1,
        length = children.length,
        node;

    while (++iterator < length) {
        node = children[iterator];

        if (node.type !== 'WhiteSpaceNode') {
            continue;
        }

        if (!EXPRESSION_MULTI_NEW_LINE.test(tokenToString(node))) {
            continue;
        }

        child.children = children.slice(0, iterator);

        parent.children.splice(index + 1, 0, node, {
            'type' : 'SentenceNode',
            'children' : children.slice(iterator + 1)
        });

        return index + 2;
    }
}

/**
 * Merges a sentence into its previous sentence, when the sentence starts
 * with a lower case letter.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeInitialLowerCaseLetterSentences(child, index, parent) {
    var node, children, iterator, previousChild;

    children = child.children;

    if (!children || !children.length || index === 0) {
        return;
    }

    iterator = -1;

    while (children[++iterator]) {
        node = children[iterator];

        if (node.type === 'PunctuationNode') {
            return;
        } else if (node.type === 'WordNode') {
            if (
                !EXPRESSION_LOWER_INITIAL_EXCEPTION.test(tokenToString(node))
            ) {
                return;
            }

            previousChild = parent.children[index - 1];

            previousChild.children = previousChild.children.concat(
                children
            );

            parent.children.splice(index, 1);

            return index - 1;
        }
    }
}

/**
 * Merges a sentence into the following sentence, when the sentence does
 * not contain word tokens.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeNonWordSentences(child, index, parent) {
    var children, iterator, otherChild;

    children = child.children;
    iterator = -1;

    while (children[++iterator]) {
        if (children[iterator].type === 'WordNode') {
            return;
        }
    }

    otherChild = parent.children[index - 1];

    if (otherChild) {
        otherChild.children = otherChild.children.concat(children);

        /* Remove the child. */
        parent.children.splice(index, 1);

        return index - 1;
    }

    otherChild = parent.children[index + 1];

    if (otherChild) {
        otherChild.children = children.concat(otherChild.children);

        /* Remove the child. */
        parent.children.splice(index, 1);

        return 0;
    }
}

/**
 * Merges punctuation- and whitespace-only between two line breaks into a
 * source node.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeSourceLines(child, index, parent) {
    var iterator, siblings, sibling, value;

    if (
        !child ||
        child.type !== 'WhiteSpaceNode' ||
        !EXPRESSION_NEW_LINE.test(tokenToString(child))
    ) {
        return;
    }

    siblings = parent.children;
    iterator = index;
    value = '';

    while (siblings[--iterator]) {
        sibling = siblings[iterator];

        if (sibling.type === 'WordNode') {
            return;
        }

        if (
            sibling.type === 'WhiteSpaceNode' &&
            EXPRESSION_NEW_LINE.test(tokenToString(sibling))
        ) {
            break;
        }

        value = tokenToString(sibling) + value;
    }

    if (!value) {
        return;
    }

    siblings.splice(iterator + 1, index - iterator - 1, {
        'type' : 'SourceNode',
        'value' : value
    });

    return iterator + 3;
}

/**
 * Moves certain punctuation following a terminal marker (thus in the
 * next sentence) to the previous sentence.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeAffixPunctuation(child, index, parent) {
    var children = child.children;

    if (!children || !children.length || index === 0) {
        return;
    }

    if (
        children[0].type !== 'PunctuationNode' ||
        !EXPRESSION_AFFIX_PUNCTUATION.test(tokenToString(children[0]))
    ) {
        return;
    }

    parent.children[index - 1].children.push(children.shift());

    return index - 1;
}

/**
 * Removes empty children.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function removeEmptyNodes(child, index, parent) {
    if ('children' in child && !child.children.length) {
        parent.children.splice(index, 1);
        return index > 0 ? index - 1 : 0;
    }
}

/**
 * Returns a function which in turn returns nodes of the given type.
 *
 * @param {string} type
 * @return {Function} - A function which creates nodes of the given type.
 * @global
 * @private
 */
function createNodeFactory(type) {
    return function (value) {
        return {
            'type' : type,
            'children' : [
                this.tokenizeText(value)
            ]
        };
    };
}

/**
 * Returns a function which in turn returns text nodes of the given type.
 *
 * @param {string} type
 * @return {Function} - A function which creates text nodes of the given type.
 * @global
 * @private
 */
function createTextNodeFactory(type) {
    return function (value) {
        if (value === null || value === undefined) {
            value = '';
        }

        return {
            'type' : type,
            'value' : String(value)
        };
    };
}

/**
 * `ParseLatin` contains the functions needed to tokenize natural Latin-script
 * language into a syntax tree.
 *
 * @constructor
 * @public
 */
function ParseLatin() {
    /*
     * TODO: This should later be removed (when this change bubbles
     * through to dependants)
     */
    if (!(this instanceof ParseLatin)) {
        return new ParseLatin();
    }
}

parseLatinPrototype = ParseLatin.prototype;

/**
 * Matches all tokens:
 * - One or more number, alphabetic, or combining characters;
 * - One or more white space characters;
 * - One or more astral plane characters;
 * - One or more of the same character;
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.EXPRESSION_TOKEN = new RegExp(
    '[' + GROUP_WORD + ']+|' +
    '[' + GROUP_WHITE_SPACE + ']+|' +
    '[' + GROUP_ASTRAL + ']+|' +
    '([\\s\\S])\\1*',
    'g'
);

/**
 * Matches a word.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.EXPRESSION_WORD = new RegExp(
    '^[' + GROUP_WORD + ']+$'
);

/**
 * Matches a string containing ONLY white space.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.EXPRESSION_WHITE_SPACE = new RegExp(
    '^[' + GROUP_WHITE_SPACE + ']+$'
);

/**
 * Tokenize natural Latin-script language into letter and numbers (words),
 * white space, and everything else (punctuation).
 *
 * @param {string?} value
 * @return {Array.<Object>} - An array of tokens.
 *
 * @public
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenize = function (value) {
    var self, tokens, delimiter, start, end, match;

    if (value === null || value === undefined) {
        value = '';
    } else if (value instanceof String) {
        value = value.toString();
    }

    if (typeof value !== 'string') {
        throw new TypeError('Illegal invocation: \'' + value +
            '\' is not a valid argument for \'ParseLatin\'');
    }

    self = this;

    tokens = [];

    if (!value) {
        return tokens;
    }

    delimiter = self.EXPRESSION_TOKEN;

    delimiter.lastIndex = 0;
    start = 0;
    match = delimiter.exec(value);

    /* for every match of the token delimiter expression... */
    while (match) {
        /*
         * Move the pointer over to after its last character.
         */
        end = match.index + match[0].length;

        /*
         * Slice the found content, from (including) start to (not including)
         * end, classify it, and add the result to tokens.
         */
        tokens.push(self.classifier(value.substring(start, end)));

        match = delimiter.exec(value);
        start = end;
    }

    return tokens;
};

/*eslint-enable no-cond-assign */

/**
 * Classify a token.
 *
 * @param {string?} value
 * @return {Object} - A classified token.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.classifier = function (value) {
    var type;

    /*
     * If the token consists solely of white space, classify it as white
     * space.
     */
    if (this.EXPRESSION_WHITE_SPACE.test(value)) {
        type = 'WhiteSpace';
    /*
     * Otherwise, if the token contains just word characters, classify it as
     * a word.
     */
    } else if (this.EXPRESSION_WORD.test(value)) {
        type = 'Word';
    /*
     * Otherwise, classify it as punctuation.
     */
    } else {
        type = 'Punctuation';
    }

    /* Return a token. */
    return this['tokenize' + type](value);
};

/**
 * Returns a source node, with its value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The SourceNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeSource = createTextNodeFactory('SourceNode');

/**
 * Returns a text node, with its value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The TextNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeText = createTextNodeFactory('TextNode');

/**
 * Returns a word node, with its children set to a single text node, its
 * value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The WordNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeWord = createNodeFactory('WordNode');

/**
 * Returns a white space node, with its children set to a single text node,
 * its value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The whiteSpaceNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeWhiteSpace = createNodeFactory('WhiteSpaceNode');

/**
 * Returns a punctuation node, with its children set to a single text node,
 * its value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The PunctuationNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizePunctuation =
    createNodeFactory('PunctuationNode');

/**
 * Tokenize natural Latin-script language into a sentence token.
 *
 * @param {string?} value
 * @return {Object} - A sentence token.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeSentence = function (value) {
    var root = {
        'type' : 'SentenceNode',
        'children' : this.tokenize(value)
    };

    modify(this.tokenizeSentenceModifiers, root);

    /*
     * Return a sentence token, with its children set to the result of
     * tokenizing the given value.
     */
    return root;
};

parseLatinPrototype.tokenizeSentenceModifiers = [
    mergeInitialWordPunctuation,
    mergeFinalWordPunctuation,
    mergeInnerWordPunctuation,
    mergeSourceLines,
    mergeInitialisms
];

/**
 * Tokenize natural Latin-script language into a paragraph token.
 *
 * @param {string?} value
 * @return {Object} - A paragraph token.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeParagraph = tokenizerFactory(ParseLatin, {
    'name' : 'tokenizeParagraph',
    'tokenizer' : 'tokenizeSentence',
    'type' : 'ParagraphNode',
    'delimiter' : EXPRESSION_TERMINAL_MARKER,
    'modifiers' : [
        mergeNonWordSentences,
        mergeAffixPunctuation,
        mergeInitialLowerCaseLetterSentences,
        mergePrefixExceptions,
        mergeAffixExceptions,
        mergeRemainingFullStops,
        makeInitialWhiteSpaceAndSourceSiblings,
        makeFinalWhiteSpaceAndSourceSiblings,
        breakImplicitSentences,
        removeEmptyNodes
    ]
});

/**
 * Tokenize natural Latin-script language into a root token.
 *
 * @param {string?} value
 * @return {Object} - A root token.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeRoot = tokenizerFactory(ParseLatin, {
    'name' : 'tokenizeRoot',
    'tokenizer' : 'tokenizeParagraph',
    'type' : 'RootNode',
    'delimiter' : EXPRESSION_NEW_LINE,
    'modifiers' : [makeFinalWhiteSpaceAndSourceSiblings, removeEmptyNodes]
});

/**
 * Tokenize natural Latin-script language into a syntax tree.
 *
 * @param {string?} value
 * @return {Object} - The tokenized document.
 *
 * @public
 * @memberof ParseLatin#
 */
parseLatinPrototype.parse = function (value) {
    return this.tokenizeRoot(value);
};

/**
 * Export ParseLatin.
 */
module.exports = ParseLatin;

});

require.register("wooorm~textom@0.1.1", function (exports, module) {
'use strict';

/**
 * Utilities.
 */
var arrayPrototype = Array.prototype,
    arrayUnshift = arrayPrototype.unshift,
    arrayPush = arrayPrototype.push,
    arraySlice = arrayPrototype.slice,
    arrayIndexOf = arrayPrototype.indexOf,
    arraySplice = arrayPrototype.splice;

/* istanbul ignore if: User forgot a polyfill much? */
if (!arrayIndexOf) {
    throw new Error('Missing Array#indexOf() method for TextOM');
}

var ROOT_NODE = 'RootNode',
    PARAGRAPH_NODE = 'ParagraphNode',
    SENTENCE_NODE = 'SentenceNode',
    WORD_NODE = 'WordNode',
    PUNCTUATION_NODE = 'PunctuationNode',
    WHITE_SPACE_NODE = 'WhiteSpaceNode',
    SOURCE_NODE = 'SourceNode',
    TEXT_NODE = 'TextNode';

function fire(context, callbacks, args) {
    var iterator = -1;

    if (!callbacks || !callbacks.length) {
        return;
    }

    callbacks = callbacks.concat();

    while (callbacks[++iterator]) {
        callbacks[iterator].apply(context, args);
    }

    return;
}

function canInsertIntoParent(parent, child) {
    var allowed = parent.allowedChildTypes;

    if (!allowed || !allowed.length || !child.type) {
        return true;
    }

    return allowed.indexOf(child.type) > -1;
}

function validateInsert(parent, item, child) {
    if (!parent) {
        throw new TypeError('Illegal invocation: \'' + parent +
            ' is not a valid argument for \'insert\'');
    }

    if (!child) {
        throw new TypeError('\'' + child +
            ' is not a valid argument for \'insert\'');
    }

    if (parent === child || parent === item) {
        throw new Error('HierarchyError: Cannot insert a node into itself');
    }

    if (!canInsertIntoParent(parent, child)) {
        throw new Error('HierarchyError: The operation would ' +
            'yield an incorrect node tree');
    }

    if (typeof child.remove !== 'function') {
        throw new Error('The operated on node did not have a ' +
            '`remove` method');
    }

    /* Insert after... */
    if (item) {
        /* istanbul ignore if: Wrong-usage */
        if (item.parent !== parent) {
            throw new Error('The operated on node (the "pointer") ' +
                'was detached from the parent');
        }

        /* istanbul ignore if: Wrong-usage */
        if (arrayIndexOf.call(parent, item) === -1) {
            throw new Error('The operated on node (the "pointer") ' +
                'was attached to its parent, but the parent has no ' +
                'indice corresponding to the item');
        }
    }
}

/**
 * Inserts the given `child` after (when given), the `item`, and otherwise as
 * the first item of the given parents.
 *
 * @param {Object} parent
 * @param {Object} item
 * @param {Object} child
 * @api private
 */
function insert(parent, item, child) {
    var next;

    validateInsert(parent, item, child);

    /* Detach the child. */
    child.remove();

    /* Set the child's parent to items parent. */
    child.parent = parent;

    if (item) {
        next = item.next;

        /* If item has a next node... */
        if (next) {
            /* ...link the child's next node, to items next node. */
            child.next = next;

            /* ...link the next nodes previous node, to the child. */
            next.prev = child;
        }

        /* Set the child's previous node to item. */
        child.prev = item;

        /* Set the next node of item to the child. */
        item.next = child;

        /* If the parent has no last node or if item is the parent last node,
         * link the parents last node to the child. */
        if (item === parent.tail || !parent.tail) {
            parent.tail = child;
            arrayPush.call(parent, child);
        /* Else, insert the child into the parent after the items index. */
        } else {
            arraySplice.call(
                parent, arrayIndexOf.call(parent, item) + 1, 0, child
            );
        }
    /* If parent has a first node... */
    } else if (parent.head) {
        next = parent.head;

        /* Set the child's next node to head. */
        child.next = next;

        /* Set the previous node of head to the child. */
        next.prev = child;

        /* Set the parents heads to the child. */
        parent.head = child;

        /* If the the parent has no last node, link the parents last node to
         * head. */
        if (!parent.tail) {
            parent.tail = next;
        }

        arrayUnshift.call(parent, child);
    /* Prepend. There is no `head` (or `tail`) node yet. */
    } else {
        /* Set parent's first node to the prependee and return the child. */
        parent.head = child;
        parent[0] = child;
        parent.length = 1;
    }

    next = child.next;

    child.emit('insert');

    if (item) {
        item.emit('changenext', child, next);
        child.emit('changeprev', item, null);
    }

    if (next) {
        next.emit('changeprev', child, item);
        child.emit('changenext', next, null);
    }

    parent.trigger('insertinside', child);

    return child;
}

/**
 * Detach a node from its (when applicable) parent, links its (when
 * existing) previous and next items to each other.
 *
 * @param {Object} node
 * @api private
 */
function remove(node) {
    /* istanbul ignore if: Wrong-usage */
    if (!node) {
        return false;
    }

    /* Cache self, the parent list, and the previous and next items. */
    var parent = node.parent,
        prev = node.prev,
        next = node.next,
        indice;

    /* If the item is already detached, return node. */
    if (!parent) {
        return node;
    }

    /* If node is the last item in the parent, link the parents last
     * item to the previous item. */
    if (parent.tail === node) {
        parent.tail = prev;
    }

    /* If node is the first item in the parent, link the parents first
     * item to the next item. */
    if (parent.head === node) {
        parent.head = next;
    }

    /* If both the last and first items in the parent are the same,
     * remove the link to the last item. */
    if (parent.tail === parent.head) {
        parent.tail = null;
    }

    /* If a previous item exists, link its next item to nodes next
     * item. */
    if (prev) {
        prev.next = next;
    }

    /* If a next item exists, link its previous item to nodes previous
     * item. */
    if (next) {
        next.prev = prev;
    }

    /* istanbul ignore else: Wrong-usage */
    if ((indice = arrayIndexOf.call(parent, node)) !== -1) {
        arraySplice.call(parent, indice, 1);
    }

    /* Remove links from node to both the next and previous items,
     * and to the parent. */
    node.prev = node.next = node.parent = null;

    node.emit('remove', parent);

    if (next) {
        next.emit('changeprev', prev || null, node);
        node.emit('changenext', null, next);
    }

    if (prev) {
        node.emit('changeprev', null, prev);
        prev.emit('changenext', next || null, node);
    }

    parent.trigger('removeinside', node, parent);

    /* Return node. */
    return node;
}

function validateSplitPosition(position, length) {
    if (
        position === null ||
        position === undefined ||
        position !== position ||
        position === -Infinity
    ) {
            position = 0;
    } else if (position === Infinity) {
        position = length;
    } else if (typeof position !== 'number') {
        throw new TypeError('\'' + position + ' is not a valid ' +
            'argument for \'#split\'');
    } else if (position < 0) {
        position = Math.abs((length + position) % length);
    }

    return position;
}

function TextOMConstructor() {
    /**
     * Expose `Node`. Initialises a new `Node` object.
     *
     * @api public
     * @constructor
     */
    function Node() {
        if (!this.data) {
            /** @member {Object} */
            this.data = {};
        }
    }

    var prototype = Node.prototype;

    prototype.on = Node.on = function (name, callback) {
        var self = this,
            callbacks;

        if (typeof name !== 'string') {
            if (name === null || name === undefined) {
                return self;
            }

            throw new TypeError('Illegal invocation: \'' + name +
                ' is not a valid argument for \'listen\'');
        }

        if (typeof callback !== 'function') {
            if (callback === null || callback === undefined) {
                return self;
            }

            throw new TypeError('Illegal invocation: \'' + callback +
                ' is not a valid argument for \'listen\'');
        }

        callbacks = self.callbacks || (self.callbacks = {});
        callbacks = callbacks[name] || (callbacks[name] = []);
        callbacks.unshift(callback);

        return self;
    };

    prototype.off = Node.off = function (name, callback) {
        var self = this,
            callbacks, indice;

        if ((name === null || name === undefined) &&
            (callback === null || callback === undefined)) {
            self.callbacks = {};
            return self;
        }

        if (typeof name !== 'string') {
            if (name === null || name === undefined) {
                return self;
            }

            throw new TypeError('Illegal invocation: \'' + name +
                ' is not a valid argument for \'listen\'');
        }

        if (!(callbacks = self.callbacks)) {
            return self;
        }

        if (!(callbacks = callbacks[name])) {
            return self;
        }

        if (typeof callback !== 'function') {
            if (callback === null || callback === undefined) {
                callbacks.length = 0;
                return self;
            }

            throw new TypeError('Illegal invocation: \'' + callback +
                ' is not a valid argument for \'listen\'');
        }

        if ((indice = callbacks.indexOf(callback)) !== -1) {
            callbacks.splice(indice, 1);
        }

        return self;
    };

    prototype.emit = function (name) {
        var self = this,
            args = arraySlice.call(arguments, 1),
            constructors = self.constructor.constructors,
            iterator = -1,
            callbacks = self.callbacks;

        if (callbacks) {
            fire(self, callbacks[name], args);
        }

        /* istanbul ignore if: Wrong-usage */
        if (!constructors) {
            return;
        }

        while (constructors[++iterator]) {
            callbacks = constructors[iterator].callbacks;

            if (callbacks) {
                fire(self, callbacks[name], args);
            }
        }
    };

    prototype.trigger = function (name) {
        var self = this,
            args = arraySlice.call(arguments, 1),
            callbacks;

        while (self) {
            callbacks = self.callbacks;
            if (callbacks) {
                fire(self, callbacks[name], args);
            }

            callbacks = self.constructor.callbacks;
            if (callbacks) {
                fire(self, callbacks[name], args);
            }

            self = self.parent;
        }
    };

    /**
     * Inherit the contexts' (Super) prototype into a given Constructor. E.g.,
     * Node is implemented by Parent, Parent is implemented by RootNode, &c.
     *
     * @param {function} Constructor
     * @api public
     */
    Node.isImplementedBy = function (Constructor) {
        var self = this,
            constructors = self.constructors || [self],
            constructorPrototype, key, newPrototype;

        constructors = [Constructor].concat(constructors);

        constructorPrototype = Constructor.prototype;

        function AltConstructor () {}
        AltConstructor.prototype = self.prototype;
        newPrototype = new AltConstructor();

        for (key in constructorPrototype) {
            /* Note: Code climate, and probably other linters, will fail
             * here. Thats okay, their wrong. */
            newPrototype[key] = constructorPrototype[key];
        }

        if (constructorPrototype.toString !== {}.toString) {
            newPrototype.toString = constructorPrototype.toString;
        }

        for (key in self) {
            /* istanbul ignore else */
            if (self.hasOwnProperty(key)) {
                Constructor[key] = self[key];
            }
        }

        newPrototype.constructor = Constructor;
        Constructor.constructors = constructors;
        Constructor.prototype = newPrototype;
    };

    /**
     * Expose Parent. Constructs a new Parent node;
     *
     * @api public
     * @constructor
     */
    function Parent() {
        Node.apply(this, arguments);
    }

    prototype = Parent.prototype;

    /**
     * The first child of a parent, null otherwise.
     *
     * @api public
     * @type {?Child}
     * @readonly
     */
    prototype.head = null;

    /**
     * The last child of a parent (unless the last child is also the first
     * child), null otherwise.
     *
     * @api public
     * @type {?Child}
     * @readonly
     */
    prototype.tail = null;

    /**
     * The number of children in a parent.
     *
     * @api public
     * @type {number}
     * @readonly
     */
    prototype.length = 0;

    /**
     * Insert a child at the beginning of the list (like Array#unshift).
     *
     * @param {Child} child - the child to insert as the (new) FIRST child
     * @return {Child} - the given child.
     * @api public
     */
    prototype.prepend = function (child) {
        return insert(this, null, child);
    };

    /**
     * Insert a child at the end of the list (like Array#push).
     *
     * @param {Child} child - the child to insert as the (new) LAST child
     * @return {Child} - the given child.
     * @api public
     */
    prototype.append = function (child) {
        return insert(this, this.tail || this.head, child);
    };

    /**
     * Return a child at given position in parent, and null otherwise. (like
     * NodeList#item).
     *
     * @param {?number} [index=0] - the position to find a child at.
     * @return {Child?} - the found child, or null.
     * @api public
     */
    prototype.item = function (index) {
        if (index === null || index === undefined) {
            index = 0;
        } else if (typeof index !== 'number' || index !== index) {
            throw new TypeError('\'' + index + ' is not a valid argument ' +
                'for \'Parent.prototype.item\'');
        }

        return this[index] || null;
    };

    /**
     * Split the Parent into two, dividing the children from 0-position (NOT
     * including the character at `position`), and position-length (including
     * the character at `position`).
     *
     * @param {?number} [position=0] - the position to split at.
     * @return {Parent} - the prepended parent.
     * @api public
     */
    prototype.split = function (position) {
        var self = this,
            clone, cloneNode, iterator;

        position = validateSplitPosition(position, self.length);

        /* This throws if we're not attached, thus preventing appending. */
        /*eslint-disable new-cap */
        cloneNode = insert(self.parent, self.prev, new self.constructor());
        /*eslint-enable new-cap */

        clone = arraySlice.call(self);
        iterator = -1;

        while (++iterator < position && clone[iterator]) {
            cloneNode.append(clone[iterator]);
        }

        return cloneNode;
    };

    /**
     * Return the result of calling `toString` on each of `Parent`s children.
     *
     * NOTE The `toString` method is intentionally generic; It can be
     * transferred to other kinds of (linked-list-like) objects for use as a
     * method.
     *
     * @return {String}
     * @api public
     */
    prototype.toString = function () {
        var value, node;

        value = '';
        node = this.head;

        while (node) {
            value += node;
            node = node.next;
        }

        return value;
    };

    /**
     * Inherit from `Node.prototype`.
     */
    Node.isImplementedBy(Parent);

    /**
     * Expose Child. Constructs a new Child node;
     *
     * @api public
     * @constructor
     */
    function Child() {
        Node.apply(this, arguments);
    }

    prototype = Child.prototype;

    /**
     * The parent node, null otherwise (when the child is detached).
     *
     * @api public
     * @type {?Parent}
     * @readonly
     */
    prototype.parent = null;

    /**
     * The next node, null otherwise (when `child` is the parents last child
     * or detached).
     *
     * @api public
     * @type {?Child}
     * @readonly
     */
    prototype.next = null;

    /**
     * The previous node, null otherwise (when `child` is the parents first
     * child or detached).
     *
     * @api public
     * @type {?Child}
     * @readonly
     */
    prototype.prev = null;

    /**
     * Insert a given child before the operated on child in the parent.
     *
     * @param {Child} child - the child to insert before the operated on
     *                        child.
     * @return {Child} - the given child.
     * @api public
     */
    prototype.before = function (child) {
        return insert(this.parent, this.prev, child);
    };

    /**
     * Insert a given child after the operated on child in the parent.
     *
     * @param {Child} child - the child to insert after the operated on child.
     * @return {Child} - the given child.
     * @api public
     */
    prototype.after = function (child) {
        return insert(this.parent, this, child);
    };

    /**
     * Remove the operated on child, and insert a given child at its previous
     * position in the parent.
     *
     * @param {Child} child - the child to replace the operated on child with.
     * @return {Child} - the given child.
     * @api public
     */
    prototype.replace = function (child) {
        var result = insert(this.parent, this, child);

        remove(this);

        return result;
    };

    /**
     * Remove the operated on child.
     *
     * @return {Child} - the operated on child.
     * @api public
     */
    prototype.remove = function () {
        return remove(this);
    };

    /**
     * Inherit from `Node.prototype`.
     */
    Node.isImplementedBy(Child);

    /**
     * Expose Element. Constructs a new Element node;
     *
     * @api public
     * @constructor
     */
    function Element() {
        Parent.apply(this, arguments);
        Child.apply(this, arguments);
    }

    /**
     * Inherit from `Parent.prototype` and `Child.prototype`.
     */
    Parent.isImplementedBy(Element);
    Child.isImplementedBy(Element);

    /* Add Parent as a constructor (which it is) */
    Element.constructors.splice(2, 0, Parent);

    /**
     * Expose Text. Constructs a new Text node;
     *
     * @api public
     * @constructor
     */
    function Text(value) {
        Child.apply(this, arguments);

        this.fromString(value);
    }

    prototype = Text.prototype;

    /**
     * The internal value.
     *
     * @api private
     */
    prototype.internalValue = '';

    /**
     * Return the internal value of a Text;
     *
     * @return {String}
     * @api public
     */
    prototype.toString = function () {
        return this.internalValue;
    };

    /**
     * (Re)sets and returns the internal value of a Text with the stringified
     * version of the given value.
     *
     * @param {?String} [value=''] - the value to set
     * @return {String}
     * @api public
     */
    prototype.fromString = function (value) {
        var self = this,
            previousValue = self.toString(),
            parent;

        if (value === null || value === undefined) {
            value = '';
        } else {
            value = value.toString();
        }

        if (value !== previousValue) {
            self.internalValue = value;

            self.emit('changetext', value, previousValue);

            parent = self.parent;
            if (parent) {
                parent.trigger(
                    'changetextinside', self, value, previousValue
                );
            }
        }

        return value;
    };

    /**
     * Split the Text into two, dividing the internal value from 0-position
     * (NOT including the character at `position`), and position-length
     * (including the character at `position`).
     *
     * @param {?number} [position=0] - the position to split at.
     * @return {Child} - the prepended child.
     * @api public
     */
    prototype.split = function (position) {
        var self = this,
            value = self.internalValue,
            cloneNode;

        position = validateSplitPosition(position, value.length);

        /* This throws if we're not attached, thus preventing substringing. */
        /*eslint-disable new-cap */
        cloneNode = insert(self.parent, self.prev, new self.constructor());
        /*eslint-enable new-cap */

        self.fromString(value.slice(position));
        cloneNode.fromString(value.slice(0, position));

        return cloneNode;
    };

    /**
     * Inherit from `Child.prototype`.
     */
    Child.isImplementedBy(Text);

    /**
     * Expose RootNode. Constructs a new RootNode (inheriting from Parent);
     *
     * @api public
     * @constructor
     */
    function RootNode() {
        Parent.apply(this, arguments);
    }

    /**
     * The type of an instance of RootNode.
     *
     * @api public
     * @readonly
     * @static
     */
    RootNode.prototype.type = ROOT_NODE;

    RootNode.prototype.allowedChildTypes = [
        PARAGRAPH_NODE,
        WHITE_SPACE_NODE,
        SOURCE_NODE
    ];

    /**
     * Inherit from `Parent.prototype`.
     */
    Parent.isImplementedBy(RootNode);

    /**
     * Expose ParagraphNode. Constructs a new ParagraphNode (inheriting from
     * both Parent and Child);
     *
     * @api public
     * @constructor
     */
    function ParagraphNode() {
        Element.apply(this, arguments);
    }

    /**
     * The type of an instance of ParagraphNode.
     *
     * @api public
     * @readonly
     * @static
     */
    ParagraphNode.prototype.type = PARAGRAPH_NODE;

    ParagraphNode.prototype.allowedChildTypes = [
        SENTENCE_NODE,
        WHITE_SPACE_NODE,
        SOURCE_NODE
    ];

    /**
     * Inherit from `Parent.prototype` and `Child.prototype`.
     */
    Element.isImplementedBy(ParagraphNode);

    /**
     * Expose SentenceNode. Constructs a new SentenceNode (inheriting from
     * both Parent and Child);
     *
     * @api public
     * @constructor
     */
    function SentenceNode() {
        Element.apply(this, arguments);
    }

    /**
     * The type of an instance of SentenceNode.
     *
     * @api public
     * @readonly
     * @static
     */
    SentenceNode.prototype.type = SENTENCE_NODE;

    SentenceNode.prototype.allowedChildTypes = [
        WORD_NODE, PUNCTUATION_NODE, WHITE_SPACE_NODE, SOURCE_NODE
    ];

    /**
     * Inherit from `Parent.prototype` and `Child.prototype`.
     */
    Element.isImplementedBy(SentenceNode);

    /**
     * Expose WordNode.
     */
    function WordNode() {
        Element.apply(this, arguments);
    }

    /**
     * The type of an instance of WordNode.
     *
     * @api public
     * @readonly
     * @static
     */
    WordNode.prototype.type = WORD_NODE;

    WordNode.prototype.allowedChildTypes = [TEXT_NODE, PUNCTUATION_NODE];

    /**
     * Inherit from `Text.prototype`.
     */
    Element.isImplementedBy(WordNode);

    /**
     * Expose PunctuationNode.
     */
    function PunctuationNode() {
        Element.apply(this, arguments);
    }

    /**
     * The type of an instance of PunctuationNode.
     *
     * @api public
     * @readonly
     * @static
     */
    PunctuationNode.prototype.type = PUNCTUATION_NODE;

    PunctuationNode.prototype.allowedChildTypes = [TEXT_NODE];

    /**
     * Inherit from `Text.prototype`.
     */
    Element.isImplementedBy(PunctuationNode);

    /**
     * Expose WhiteSpaceNode.
     */
    function WhiteSpaceNode() {
        PunctuationNode.apply(this, arguments);
    }

    /**
     * The type of an instance of WhiteSpaceNode.
     *
     * @api public
     * @readonly
     * @static
     */
    WhiteSpaceNode.prototype.type = WHITE_SPACE_NODE;

    WhiteSpaceNode.prototype.allowedChildTypes = [TEXT_NODE];

    /**
     * Inherit from `Text.prototype`.
     */
    PunctuationNode.isImplementedBy(WhiteSpaceNode);

    /**
     * Expose SourceNode.
     */
    function SourceNode() {
        Text.apply(this, arguments);
    }

    /**
     * The type of an instance of SourceNode.
     *
     * @api public
     * @readonly
     * @static
     */
    SourceNode.prototype.type = SOURCE_NODE;

    /**
     * Inherit from `Text.prototype`.
     */
    Text.isImplementedBy(SourceNode);

    /**
     * Expose TextNode.
     */
    function TextNode() {
        Text.apply(this, arguments);
    }

    /**
     * The type of an instance of TextNode.
     *
     * @api public
     * @readonly
     * @static
     */
    TextNode.prototype.type = TEXT_NODE;

    /**
     * Inherit from `Text.prototype`.
     */
    Text.isImplementedBy(TextNode);

    var nodePrototype = Node.prototype,
        TextOM;

    /**
     * Define the `TextOM` object.
     * Expose `TextOM` on every instance of Node.
     *
     * @api public
     */
    nodePrototype.TextOM = TextOM = {};

    /**
     * Export all node types to `TextOM` and `Node#`.
     */
    TextOM.ROOT_NODE = nodePrototype.ROOT_NODE = ROOT_NODE;
    TextOM.PARAGRAPH_NODE = nodePrototype.PARAGRAPH_NODE = PARAGRAPH_NODE;
    TextOM.SENTENCE_NODE = nodePrototype.SENTENCE_NODE = SENTENCE_NODE;
    TextOM.WORD_NODE = nodePrototype.WORD_NODE = WORD_NODE;
    TextOM.PUNCTUATION_NODE = nodePrototype.PUNCTUATION_NODE =
        PUNCTUATION_NODE;
    TextOM.WHITE_SPACE_NODE = nodePrototype.WHITE_SPACE_NODE =
        WHITE_SPACE_NODE;
    TextOM.SOURCE_NODE = nodePrototype.SOURCE_NODE = SOURCE_NODE;
    TextOM.TEXT_NODE = nodePrototype.TEXT_NODE = TEXT_NODE;

    /**
     * Export all `Node`s to `TextOM`.
     */
    TextOM.Node = Node;
    TextOM.Parent = Parent;
    TextOM.Child = Child;
    TextOM.Element = Element;
    TextOM.Text = Text;
    TextOM.RootNode = RootNode;
    TextOM.ParagraphNode = ParagraphNode;
    TextOM.SentenceNode = SentenceNode;
    TextOM.WordNode = WordNode;
    TextOM.PunctuationNode = PunctuationNode;
    TextOM.WhiteSpaceNode = WhiteSpaceNode;
    TextOM.SourceNode = SourceNode;
    TextOM.TextNode = TextNode;

    /**
     * Expose `TextOM`. Used to instantiate a new `RootNode`.
     */
    return TextOM;
}

module.exports = TextOMConstructor;

});

require.register("visionmedia~co@3.1.0", function (exports, module) {

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co;

/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var isGenFun = isGeneratorFunction(fn);

  return function (done) {
    var ctx = this;

    // in toThunk() below we invoke co()
    // with a generator, so optimize for
    // this case
    var gen = fn;

    // we only need to parse the arguments
    // if gen is a generator function.
    if (isGenFun) {
      var args = slice.call(arguments), len = args.length;
      var hasCallback = len && 'function' == typeof args[len - 1];
      done = hasCallback ? args.pop() : error;
      gen = fn.apply(this, args);
    } else {
      done = done || error;
    }

    next();

    // #92
    // wrap the callback in a setImmediate
    // so that any of its errors aren't caught by `co`
    function exit(err, res) {
      setImmediate(function(){
        done.call(ctx, err, res);
      });
    }

    function next(err, res) {
      var ret;

      // multiple args
      if (arguments.length > 2) res = slice.call(arguments, 1);

      // error
      if (err) {
        try {
          ret = gen.throw(err);
        } catch (e) {
          return exit(e);
        }
      }

      // ok
      if (!err) {
        try {
          ret = gen.next(res);
        } catch (e) {
          return exit(e);
        }
      }

      // done
      if (ret.done) return exit(null, ret.value);

      // normalize
      ret.value = toThunk(ret.value, ctx);

      // run
      if ('function' == typeof ret.value) {
        var called = false;
        try {
          ret.value.call(ctx, function(){
            if (called) return;
            called = true;
            next.apply(ctx, arguments);
          });
        } catch (e) {
          setImmediate(function(){
            if (called) return;
            called = true;
            next(e);
          });
        }
        return;
      }

      // invalid
      next(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following was passed: "' + String(ret.value) + '"'));
    }
  }
}

/**
 * Convert `obj` into a normalized thunk.
 *
 * @param {Mixed} obj
 * @param {Mixed} ctx
 * @return {Function}
 * @api private
 */

function toThunk(obj, ctx) {

  if (isGeneratorFunction(obj)) {
    return co(obj.call(ctx));
  }

  if (isGenerator(obj)) {
    return co(obj);
  }

  if (isPromise(obj)) {
    return promiseToThunk(obj);
  }

  if ('function' == typeof obj) {
    return obj;
  }

  if (isObject(obj) || Array.isArray(obj)) {
    return objectToThunk.call(ctx, obj);
  }

  return obj;
}

/**
 * Convert an object of yieldables to a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToThunk(obj){
  var ctx = this;
  var isArray = Array.isArray(obj);

  return function(done){
    var keys = Object.keys(obj);
    var pending = keys.length;
    var results = isArray
      ? new Array(pending) // predefine the array length
      : new obj.constructor();
    var finished;

    if (!pending) {
      setImmediate(function(){
        done(null, results)
      });
      return;
    }

    // prepopulate object keys to preserve key ordering
    if (!isArray) {
      for (var i = 0; i < pending; i++) {
        results[keys[i]] = undefined;
      }
    }

    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
}

/**
 * Convert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function(fn){
    promise.then(function(res) {
      fn(null, res);
    }, fn);
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return obj && 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return val && Object == val.constructor;
}

/**
 * Throw `err` in a new stack.
 *
 * This is used when co() is invoked
 * without supplying a callback, which
 * should only be for demonstrational
 * purposes.
 *
 * @param {Error} err
 * @api private
 */

function error(err) {
  if (!err) return;
  setImmediate(function(){
    throw err;
  });
}

});

require.register("matthewmueller~wrap-fn@0.1.1", function (exports, module) {
/**
 * Module Dependencies
 */

var slice = [].slice;
var co = require("visionmedia~co@3.1.0");
var noop = function(){};

/**
 * Export `wrap-fn`
 */

module.exports = wrap;

/**
 * Wrap a function to support
 * sync, async, and gen functions.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api public
 */

function wrap(fn, done) {
  done = done || noop;

  return function() {
    var args = slice.call(arguments);
    var ctx = this;

    // done
    if (!fn) {
      return done.apply(ctx, [null].concat(args));
    }

    // async
    if (fn.length > args.length) {
      return fn.apply(ctx, args.concat(done));
    }

    // generator
    if (generator(fn)) {
      return co(fn).apply(ctx, args.concat(done));
    }

    // sync
    return sync(fn, done).apply(ctx, args);
  }
}

/**
 * Wrap a synchronous function execution.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api private
 */

function sync(fn, done) {
  return function () {
    var ret;

    try {
      ret = fn.apply(this, arguments);
    } catch (err) {
      return done(err);
    }

    if (promise(ret)) {
      ret.then(function (value) { done(null, value); }, done);
    } else {
      ret instanceof Error ? done(ret) : done(null, ret);
    }
  }
}

/**
 * Is `value` a generator?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function generator(value) {
  return value
    && value.constructor
    && 'GeneratorFunction' == value.constructor.name;
}


/**
 * Is `value` a promise?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function promise(value) {
  return value && 'function' == typeof value.then;
}

});

require.register("segmentio~ware@1.2.0", function (exports, module) {
/**
 * Module Dependencies
 */

var slice = [].slice;
var wrap = require("matthewmueller~wrap-fn@0.1.1");

/**
 * Expose `Ware`.
 */

module.exports = Ware;

/**
 * Initialize a new `Ware` manager, with optional `fns`.
 *
 * @param {Function or Array or Ware} fn (optional)
 */

function Ware (fn) {
  if (!(this instanceof Ware)) return new Ware(fn);
  this.fns = [];
  if (fn) this.use(fn);
}

/**
 * Use a middleware `fn`.
 *
 * @param {Function or Array or Ware} fn
 * @return {Ware}
 */

Ware.prototype.use = function (fn) {
  if (fn instanceof Ware) {
    return this.use(fn.fns);
  }

  if (fn instanceof Array) {
    for (var i = 0, f; f = fn[i++];) this.use(f);
    return this;
  }

  this.fns.push(fn);
  return this;
};

/**
 * Run through the middleware with the given `args` and optional `callback`.
 *
 * @param {Mixed} args...
 * @param {Function} callback (optional)
 * @return {Ware}
 */

Ware.prototype.run = function () {
  var fns = this.fns;
  var ctx = this;
  var i = 0;
  var last = arguments[arguments.length - 1];
  var done = 'function' == typeof last && last;
  var args = done
    ? slice.call(arguments, 0, arguments.length - 1)
    : slice.call(arguments);

  // next step
  function next (err) {
    if (err) return done(err);
    var fn = fns[i++];
    var arr = slice.call(args);

    if (!fn) {
      return done && done.apply(null, [null].concat(args));
    }

    wrap(fn, next).apply(ctx, arr);
  }

  next();

  return this;
};

});

require.register("wooorm~retext@0.2.0-rc.3", function (exports, module) {
'use strict';

var TextOMConstructor,
    ParseLatin,
    Ware,
    has;

/**
 * Module dependencies.
 */

TextOMConstructor = require("wooorm~textom@0.1.1");
ParseLatin = require("wooorm~parse-latin@0.1.3");
Ware = require("segmentio~ware@1.2.0");

/**
 * Cached, fast, secure existence test.
 */

has = Object.prototype.hasOwnProperty;

/**
 * Transform a concrete syntax tree into a tree constructed
 * from a given object model.
 *
 * @param {Object} TextOM - the object model.
 * @param {Object} cst - the concrete syntax tree to
 *   transform.
 * @return {Node} the node constructed from the
 *   CST and the object model.
 */

function fromCST(TextOM, cst) {
    var index,
        node,
        children,
        data,
        attribute;

    node = new TextOM[cst.type]();

    if ('children' in cst) {
        index = -1;
        children = cst.children;

        while (children[++index]) {
            node.append(fromCST(TextOM, children[index]));
        }
    } else {
        node.fromString(cst.value);
    }

    /**
     * Currently, `data` properties are not really
     * specified or documented. Therefore, the following
     * branch is ignored by Istanbul.
     *
     * The idea is that plugins and parsers can each
     * attach data to nodes, in a similar fashion to the
     * DOMs dataset, which can be stringified and parsed
     * back and forth between the concrete syntax tree
     * and the node.
     */

    /* istanbul ignore if: TODO, Untestable, will change soon. */
    if ('data' in cst) {
        data = cst.data;

        for (attribute in data) {
            if (has.call(data, attribute)) {
                node.data[attribute] = data[attribute];
            }
        }
    }

    return node;
}

/**
 * Construct an instance of `Retext`.
 *
 * @param {Function?} parser - the parser to use. Defaults
 *   to a new instance of `parse-latin`.
 * @constructor
 */

function Retext(parser) {
    var self,
        TextOM;

    if (!parser) {
        parser = new ParseLatin();
    }

    self = this;
    TextOM = new TextOMConstructor();

    self.ware = new Ware();
    self.parser = parser;
    self.TextOM = TextOM;

    /**
     * Expose `TextOM` on `parser`, and vice versa.
     */

    parser.TextOM = TextOM;
    TextOM.parser = parser;
}

/**
 * Attaches `plugin`: a humble function.
 *
 * When `parse` or `run` is invoked, `plugin` is
 * invoked with `node` and a `retext` instance.
 *
 * If `plugin` contains asynchronous functionality, it
 * should accept a third argument (`next`) and invoke
 * it on completion.
 *
 * `plugin.attach` is invoked with a `retext` instance
 * when attached, enabling `plugin` to depend on other
 * plugins.
 *
 * Code to initialize `plugin` should go into its `attach`
 * method, such as functionality to modify the object model
 * (TextOM), the parser (e.g., `parse-latin`), or the
 * `retext` instance. `plugin.attach` is invoked when
 * `plugin` is attached to a `retext` instance.
 *
 * @param {function(Node, Retext, Function?)} plugin -
 *   functionality to analyze and manipulate a node.
 * @param {function(Retext)} plugin.attach - functionality
 *   to initialize `plugin`.
 * @return this
 */

Retext.prototype.use = function (plugin) {
    var self;

    if (typeof plugin !== 'function') {
        throw new TypeError(
            'Illegal invocation: `' + plugin + '` ' +
            'is not a valid argument for `Retext#use(plugin)`'
        );
    }

    self = this;

    if (self.ware.fns.indexOf(plugin) === -1) {
        self.ware.use(plugin);

        if (plugin.attach) {
            plugin.attach(self);
        }
    }

    return self;
};

/**
 * Transform a given value into a node, applies attached
 * plugins to the node, and invokes `done` with either an
 * error (first argument) or the transformed node (second
 * argument).
 *
 * @param {string?} value - The value to transform.
 * @param {function(Error, Node)} done - Callback to
 *   invoke when the transformations have completed.
 * @return this
 */

Retext.prototype.parse = function (value, done) {
    var self,
        cst;

    if (typeof done !== 'function') {
        throw new TypeError(
            'Illegal invocation: `' + done + '` ' +
            'is not a valid argument for `Retext#parse(value, done)`.\n' +
            'This breaking change occurred in 0.2.0-rc.1, see GitHub for ' +
            'more information.'
        );
    }

    self = this;

    cst = self.parser.parse(value);

    self.run(fromCST(self.TextOM, cst), done);

    return self;
};

/**
 * Applies attached plugins to `node` and invokes `done`
 * with either an error (first argument) or the transformed
 * `node` (second argument).
 *
 * @param {Node} node - The node to apply attached
 *   plugins to.
 * @param {function(Error, Node)} done - Callback to
 *   invoke when the transformations have completed.
 * @return this
 */

Retext.prototype.run = function (node, done) {
    var self;

    if (typeof done !== 'function') {
        throw new TypeError(
            'Illegal invocation: `' + done + '` ' +
            'is not a valid argument for ' +
            '`Retext#run(node, done)`.\n' +
            'This breaking change occurred in 0.2.0-rc.1, see GitHub for ' +
            'more information.'
        );
    }

    self = this;

    self.ware.run(node, self, done);

    return self;
};

/**
 * Expose `Retext`.
 */

module.exports = Retext;

});

require.register("wooorm~afinn-111@0.1.0", function (exports, module) {
module.exports = require("wooorm~afinn-111@0.1.0/data/afinn-111.json");

});

require.define("wooorm~afinn-111@0.1.0/data/afinn-111.json", {"abandon":-2,"zealous":2,"abandons":-2,"abducted":-2,"abduction":-2,"abductions":-2,"abhor":-3,"abhorred":-3,"abhorrent":-3,"abhors":-3,"abilities":2,"ability":2,"aboard":1,"absentee":-1,"absentees":-1,"absolve":2,"absolved":2,"absolves":2,"absolving":2,"absorbed":1,"abuse":-3,"abused":-3,"abuses":-3,"abusive":-3,"accept":1,"accepted":1,"accepting":1,"accepts":1,"accident":-2,"accidental":-2,"accidentally":-2,"accidents":-2,"accomplish":2,"accomplished":2,"accomplishes":2,"accusation":-2,"accusations":-2,"accuse":-2,"accused":-2,"accuses":-2,"accusing":-2,"ache":-2,"achievable":1,"aching":-2,"acquit":2,"acquits":2,"acquitted":2,"acquitting":2,"acrimonious":-3,"active":1,"adequate":1,"admire":3,"admired":3,"admires":3,"admiring":3,"admit":-1,"admits":-1,"admitted":-1,"admonish":-2,"admonished":-2,"adopt":1,"adopts":1,"adorable":3,"adore":3,"adored":3,"adores":3,"advanced":1,"advantage":2,"advantages":2,"adventure":2,"adventures":2,"adventurous":2,"affected":-1,"affection":3,"affectionate":3,"afflicted":-1,"affronted":-1,"afraid":-2,"aggravate":-2,"aggravated":-2,"aggravates":-2,"aggravating":-2,"aggression":-2,"aggressions":-2,"aggressive":-2,"aghast":-2,"agog":2,"agonise":-3,"agonised":-3,"agonises":-3,"agonising":-3,"agonize":-3,"agonized":-3,"agonizes":-3,"agonizing":-3,"agree":1,"agreeable":2,"agreed":1,"agreement":1,"agrees":1,"alarm":-2,"alarmed":-2,"alarmist":-2,"alarmists":-2,"alas":-1,"alert":-1,"alienation":-2,"alive":1,"allergic":-2,"allow":1,"alone":-2,"amaze":2,"amazed":2,"amazes":2,"amazing":4,"ambitious":2,"ambivalent":-1,"amuse":3,"amused":3,"amusement":3,"amusements":3,"anger":-3,"angers":-3,"angry":-3,"anguish":-3,"anguished":-3,"animosity":-2,"annoy":-2,"annoyance":-2,"annoyed":-2,"annoying":-2,"annoys":-2,"antagonistic":-2,"anti":-1,"anticipation":1,"anxiety":-2,"anxious":-2,"apathetic":-3,"apathy":-3,"apeshit":-3,"apocalyptic":-2,"apologise":-1,"apologised":-1,"apologises":-1,"apologising":-1,"apologize":-1,"apologized":-1,"apologizes":-1,"apologizing":-1,"apology":-1,"appalled":-2,"appalling":-2,"appease":2,"appeased":2,"appeases":2,"appeasing":2,"applaud":2,"applauded":2,"applauding":2,"applauds":2,"applause":2,"appreciate":2,"appreciated":2,"appreciates":2,"appreciating":2,"appreciation":2,"apprehensive":-2,"approval":2,"approved":2,"approves":2,"ardent":1,"arrest":-2,"arrested":-3,"arrests":-2,"arrogant":-2,"ashame":-2,"ashamed":-2,"ass":-4,"assassination":-3,"assassinations":-3,"asset":2,"assets":2,"assfucking":-4,"asshole":-4,"astonished":2,"astound":3,"astounded":3,"astounding":3,"astoundingly":3,"astounds":3,"attack":-1,"attacked":-1,"attacking":-1,"attacks":-1,"attract":1,"attracted":1,"attracting":2,"attraction":2,"attractions":2,"attracts":1,"audacious":3,"authority":1,"avert":-1,"averted":-1,"averts":-1,"avid":2,"avoid":-1,"avoided":-1,"avoids":-1,"await":-1,"awaited":-1,"awaits":-1,"award":3,"awarded":3,"abandoned":-2,"awesome":4,"awful":-3,"awkward":-2,"axe":-1,"axed":-1,"backed":1,"backing":2,"backs":1,"bad":-3,"badass":-3,"badly":-3,"bailout":-2,"bamboozle":-2,"bamboozled":-2,"bamboozles":-2,"ban":-2,"banish":-1,"bankrupt":-3,"bankster":-3,"banned":-2,"bargain":2,"barrier":-2,"bastard":-5,"bastards":-5,"battle":-1,"battles":-1,"beaten":-2,"beatific":3,"beating":-1,"beauties":3,"beautiful":3,"beautifully":3,"beautify":3,"belittle":-2,"belittled":-2,"beloved":3,"benefit":2,"benefits":2,"benefitted":2,"benefitting":2,"bereave":-2,"bereaved":-2,"bereaves":-2,"bereaving":-2,"best":3,"betray":-3,"betrayal":-3,"betrayed":-3,"betraying":-3,"betrays":-3,"better":2,"bias":-1,"biased":-2,"big":1,"bitch":-5,"bitches":-5,"bitter":-2,"bitterly":-2,"bizarre":-2,"blah":-2,"blame":-2,"blamed":-2,"blames":-2,"blaming":-2,"bless":2,"blesses":2,"blessing":3,"blind":-1,"bliss":3,"blissful":3,"blithe":2,"block":-1,"blockbuster":3,"blocked":-1,"blocking":-1,"blocks":-1,"bloody":-3,"blurry":-2,"boastful":-2,"bold":2,"boldly":2,"bomb":-1,"boost":1,"boosted":1,"boosting":1,"boosts":1,"bore":-2,"bored":-2,"boring":-3,"bother":-2,"bothered":-2,"bothers":-2,"bothersome":-2,"boycott":-2,"boycotted":-2,"boycotting":-2,"boycotts":-2,"brainwashing":-3,"brave":2,"breakthrough":3,"breathtaking":5,"bribe":-3,"bright":1,"brightest":2,"brightness":1,"brilliant":4,"brisk":2,"broke":-1,"broken":-1,"brooding":-2,"bullied":-2,"bullshit":-4,"bully":-2,"bullying":-2,"bummer":-2,"buoyant":2,"burden":-2,"burdened":-2,"burdening":-2,"burdens":-2,"calm":2,"calmed":2,"calming":2,"calms":2,"can't stand":-3,"cancel":-1,"cancelled":-1,"cancelling":-1,"cancels":-1,"cancer":-1,"capable":1,"captivated":3,"care":2,"carefree":1,"careful":2,"carefully":2,"careless":-2,"cares":2,"cashing in":-2,"casualty":-2,"catastrophe":-3,"catastrophic":-4,"cautious":-1,"celebrate":3,"celebrated":3,"celebrates":3,"celebrating":3,"censor":-2,"censored":-2,"censors":-2,"certain":1,"chagrin":-2,"chagrined":-2,"challenge":-1,"chance":2,"chances":2,"chaos":-2,"chaotic":-2,"charged":-3,"charges":-2,"charm":3,"charming":3,"charmless":-3,"chastise":-3,"chastised":-3,"chastises":-3,"chastising":-3,"cheat":-3,"cheated":-3,"cheater":-3,"cheaters":-3,"cheats":-3,"cheer":2,"cheered":2,"cheerful":2,"cheering":2,"cheerless":-2,"cheers":2,"cheery":3,"cherish":2,"cherished":2,"cherishes":2,"cherishing":2,"chic":2,"childish":-2,"chilling":-1,"choke":-2,"choked":-2,"chokes":-2,"choking":-2,"clarifies":2,"clarity":2,"clash":-2,"classy":3,"clean":2,"cleaner":2,"clear":1,"cleared":1,"clearly":1,"clears":1,"clever":2,"clouded":-1,"clueless":-2,"cock":-5,"cocksucker":-5,"cocksuckers":-5,"cocky":-2,"coerced":-2,"collapse":-2,"collapsed":-2,"collapses":-2,"collapsing":-2,"collide":-1,"collides":-1,"colliding":-1,"collision":-2,"collisions":-2,"colluding":-3,"combat":-1,"combats":-1,"comedy":1,"comfort":2,"comfortable":2,"comforting":2,"comforts":2,"commend":2,"commended":2,"commit":1,"commitment":2,"commits":1,"committed":1,"committing":1,"compassionate":2,"compelled":1,"competent":2,"competitive":2,"complacent":-2,"complain":-2,"complained":-2,"complains":-2,"comprehensive":2,"conciliate":2,"conciliated":2,"conciliates":2,"conciliating":2,"condemn":-2,"condemnation":-2,"condemned":-2,"condemns":-2,"confidence":2,"confident":2,"conflict":-2,"conflicting":-2,"conflictive":-2,"conflicts":-2,"confuse":-2,"confused":-2,"confusing":-2,"congrats":2,"congratulate":2,"congratulation":2,"congratulations":2,"consent":2,"consents":2,"consolable":2,"conspiracy":-3,"constrained":-2,"contagion":-2,"contagions":-2,"contagious":-1,"contempt":-2,"contemptuous":-2,"contemptuously":-2,"contend":-1,"contender":-1,"contending":-1,"contentious":-2,"contestable":-2,"controversial":-2,"controversially":-2,"convince":1,"convinced":1,"convinces":1,"convivial":2,"cool":1,"cool stuff":3,"cornered":-2,"corpse":-1,"costly":-2,"courage":2,"courageous":2,"courteous":2,"courtesy":2,"cover-up":-3,"coward":-2,"cowardly":-2,"coziness":2,"cramp":-1,"crap":-3,"crash":-2,"crazier":-2,"craziest":-2,"crazy":-2,"creative":2,"crestfallen":-2,"cried":-2,"cries":-2,"crime":-3,"criminal":-3,"criminals":-3,"crisis":-3,"critic":-2,"criticism":-2,"criticize":-2,"criticized":-2,"criticizes":-2,"criticizing":-2,"critics":-2,"cruel":-3,"cruelty":-3,"crush":-1,"crushed":-2,"crushes":-1,"crushing":-1,"cry":-1,"crying":-2,"cunt":-5,"curious":1,"curse":-1,"cut":-1,"cute":2,"cuts":-1,"cutting":-1,"cynic":-2,"cynical":-2,"cynicism":-2,"damage":-3,"damages":-3,"damn":-4,"damned":-4,"damnit":-4,"danger":-2,"daredevil":2,"daring":2,"darkest":-2,"darkness":-1,"dauntless":2,"dead":-3,"deadlock":-2,"deafening":-1,"dear":2,"dearly":3,"death":-2,"debonair":2,"debt":-2,"deceit":-3,"deceitful":-3,"deceive":-3,"deceived":-3,"deceives":-3,"deceiving":-3,"deception":-3,"decisive":1,"dedicated":2,"defeated":-2,"defect":-3,"defects":-3,"defender":2,"defenders":2,"defenseless":-2,"defer":-1,"deferring":-1,"defiant":-1,"deficit":-2,"degrade":-2,"degraded":-2,"degrades":-2,"dehumanize":-2,"dehumanized":-2,"dehumanizes":-2,"dehumanizing":-2,"deject":-2,"dejected":-2,"dejecting":-2,"dejects":-2,"delay":-1,"delayed":-1,"delight":3,"delighted":3,"delighting":3,"delights":3,"demand":-1,"demanded":-1,"demanding":-1,"demands":-1,"demonstration":-1,"demoralized":-2,"denied":-2,"denier":-2,"deniers":-2,"denies":-2,"denounce":-2,"denounces":-2,"deny":-2,"denying":-2,"depressed":-2,"depressing":-2,"derail":-2,"derailed":-2,"derails":-2,"deride":-2,"derided":-2,"derides":-2,"deriding":-2,"derision":-2,"desirable":2,"desire":1,"desired":2,"desirous":2,"despair":-3,"despairing":-3,"despairs":-3,"desperate":-3,"desperately":-3,"despondent":-3,"destroy":-3,"destroyed":-3,"destroying":-3,"destroys":-3,"destruction":-3,"destructive":-3,"detached":-1,"detain":-2,"detained":-2,"detention":-2,"determined":2,"devastate":-2,"devastated":-2,"devastating":-2,"devoted":3,"diamond":1,"dick":-4,"dickhead":-4,"die":-3,"died":-3,"difficult":-1,"diffident":-2,"dilemma":-1,"dipshit":-3,"dire":-3,"direful":-3,"dirt":-2,"dirtier":-2,"dirtiest":-2,"dirty":-2,"disabling":-1,"disadvantage":-2,"disadvantaged":-2,"disappear":-1,"disappeared":-1,"disappears":-1,"disappoint":-2,"disappointed":-2,"disappointing":-2,"disappointment":-2,"disappointments":-2,"disappoints":-2,"disaster":-2,"disasters":-2,"disastrous":-3,"disbelieve":-2,"discard":-1,"discarded":-1,"discarding":-1,"discards":-1,"disconsolate":-2,"disconsolation":-2,"discontented":-2,"discord":-2,"discounted":-1,"discouraged":-2,"discredited":-2,"disdain":-2,"disgrace":-2,"disgraced":-2,"disguise":-1,"disguised":-1,"disguises":-1,"disguising":-1,"disgust":-3,"disgusted":-3,"disgusting":-3,"disheartened":-2,"dishonest":-2,"disillusioned":-2,"disinclined":-2,"disjointed":-2,"dislike":-2,"dismal":-2,"dismayed":-2,"disorder":-2,"disorganized":-2,"disoriented":-2,"disparage":-2,"disparaged":-2,"disparages":-2,"disparaging":-2,"displeased":-2,"dispute":-2,"disputed":-2,"disputes":-2,"disputing":-2,"disqualified":-2,"disquiet":-2,"disregard":-2,"disregarded":-2,"disregarding":-2,"disregards":-2,"disrespect":-2,"disrespected":-2,"disruption":-2,"disruptions":-2,"disruptive":-2,"dissatisfied":-2,"distort":-2,"distorted":-2,"distorting":-2,"distorts":-2,"distract":-2,"distracted":-2,"distraction":-2,"distracts":-2,"distress":-2,"distressed":-2,"distresses":-2,"distressing":-2,"distrust":-3,"distrustful":-3,"disturb":-2,"disturbed":-2,"disturbing":-2,"disturbs":-2,"dithering":-2,"dizzy":-1,"dodging":-2,"dodgy":-2,"does not work":-3,"dolorous":-2,"dont like":-2,"doom":-2,"doomed":-2,"doubt":-1,"doubted":-1,"doubtful":-1,"doubting":-1,"doubts":-1,"douche":-3,"douchebag":-3,"downcast":-2,"downhearted":-2,"downside":-2,"drag":-1,"dragged":-1,"drags":-1,"drained":-2,"dread":-2,"dreaded":-2,"dreadful":-3,"dreading":-2,"dream":1,"dreams":1,"dreary":-2,"droopy":-2,"drop":-1,"drown":-2,"drowned":-2,"drowns":-2,"drunk":-2,"dubious":-2,"dud":-2,"dull":-2,"dumb":-3,"dumbass":-3,"dump":-1,"dumped":-2,"dumps":-1,"dupe":-2,"duped":-2,"dysfunction":-2,"eager":2,"earnest":2,"ease":2,"easy":1,"ecstatic":4,"eerie":-2,"eery":-2,"effective":2,"effectively":2,"elated":3,"elation":3,"elegant":2,"elegantly":2,"embarrass":-2,"embarrassed":-2,"embarrasses":-2,"embarrassing":-2,"embarrassment":-2,"embittered":-2,"embrace":1,"emergency":-2,"empathetic":2,"emptiness":-1,"empty":-1,"enchanted":2,"encourage":2,"encouraged":2,"encouragement":2,"encourages":2,"endorse":2,"endorsed":2,"endorsement":2,"endorses":2,"enemies":-2,"enemy":-2,"energetic":2,"engage":1,"engages":1,"engrossed":1,"enjoy":2,"enjoying":2,"enjoys":2,"enlighten":2,"enlightened":2,"enlightening":2,"enlightens":2,"ennui":-2,"enrage":-2,"enraged":-2,"enrages":-2,"enraging":-2,"enrapture":3,"enslave":-2,"enslaved":-2,"enslaves":-2,"ensure":1,"ensuring":1,"enterprising":1,"entertaining":2,"enthral":3,"enthusiastic":3,"entitled":1,"entrusted":2,"envies":-1,"envious":-2,"envy":-1,"envying":-1,"erroneous":-2,"error":-2,"errors":-2,"escape":-1,"escapes":-1,"escaping":-1,"esteemed":2,"ethical":2,"euphoria":3,"euphoric":4,"eviction":-1,"evil":-3,"exaggerate":-2,"exaggerated":-2,"exaggerates":-2,"exaggerating":-2,"exasperated":2,"excellence":3,"excellent":3,"excite":3,"excited":3,"excitement":3,"exciting":3,"exclude":-1,"excluded":-2,"exclusion":-1,"exclusive":2,"excuse":-1,"exempt":-1,"exhausted":-2,"exhilarated":3,"exhilarates":3,"exhilarating":3,"exonerate":2,"exonerated":2,"exonerates":2,"exonerating":2,"expand":1,"expands":1,"expel":-2,"expelled":-2,"expelling":-2,"expels":-2,"exploit":-2,"exploited":-2,"exploiting":-2,"exploits":-2,"exploration":1,"explorations":1,"expose":-1,"exposed":-1,"exposes":-1,"exposing":-1,"extend":1,"extends":1,"exuberant":4,"exultant":3,"exultantly":3,"fabulous":4,"fad":-2,"fag":-3,"faggot":-3,"faggots":-3,"fail":-2,"failed":-2,"failing":-2,"fails":-2,"failure":-2,"failures":-2,"fainthearted":-2,"fair":2,"faith":1,"faithful":3,"fake":-3,"fakes":-3,"faking":-3,"fallen":-2,"falling":-1,"falsified":-3,"falsify":-3,"fame":1,"fan":3,"fantastic":4,"farce":-1,"fascinate":3,"fascinated":3,"fascinates":3,"fascinating":3,"fascist":-2,"fascists":-2,"fatalities":-3,"fatality":-3,"fatigue":-2,"fatigued":-2,"fatigues":-2,"fatiguing":-2,"favor":2,"favored":2,"favorite":2,"favorited":2,"favorites":2,"favors":2,"fear":-2,"fearful":-2,"fearing":-2,"fearless":2,"fearsome":-2,"fed up":-3,"feeble":-2,"feeling":1,"felonies":-3,"felony":-3,"fervent":2,"fervid":2,"festive":2,"fiasco":-3,"fidgety":-2,"fight":-1,"fine":2,"fire":-2,"fired":-2,"firing":-2,"fit":1,"fitness":1,"flagship":2,"flees":-1,"flop":-2,"flops":-2,"flu":-2,"flustered":-2,"focused":2,"fond":2,"fondness":2,"fool":-2,"foolish":-2,"fools":-2,"forced":-1,"foreclosure":-2,"foreclosures":-2,"forget":-1,"forgetful":-2,"forgive":1,"forgiving":1,"forgotten":-1,"fortunate":2,"frantic":-1,"fraud":-4,"frauds":-4,"fraudster":-4,"fraudsters":-4,"fraudulence":-4,"fraudulent":-4,"free":1,"freedom":2,"frenzy":-3,"fresh":1,"friendly":2,"fright":-2,"frightened":-2,"frightening":-3,"frikin":-2,"frisky":2,"frowning":-1,"frustrate":-2,"frustrated":-2,"frustrates":-2,"frustrating":-2,"frustration":-2,"ftw":3,"fuck":-4,"fucked":-4,"fucker":-4,"fuckers":-4,"fuckface":-4,"fuckhead":-4,"fucking":-4,"fucktard":-4,"fud":-3,"fuked":-4,"fuking":-4,"fulfill":2,"fulfilled":2,"fulfills":2,"fuming":-2,"fun":4,"funeral":-1,"funerals":-1,"funky":2,"funnier":4,"funny":4,"furious":-3,"futile":2,"gag":-2,"gagged":-2,"gain":2,"gained":2,"gaining":2,"gains":2,"gallant":3,"gallantly":3,"gallantry":3,"generous":2,"genial":3,"ghost":-1,"giddy":-2,"gift":2,"glad":3,"glamorous":3,"glamourous":3,"glee":3,"gleeful":3,"gloom":-1,"gloomy":-2,"glorious":2,"glory":2,"glum":-2,"god":1,"goddamn":-3,"godsend":4,"good":3,"goodness":3,"grace":1,"gracious":3,"grand":3,"grant":1,"granted":1,"granting":1,"grants":1,"grateful":3,"gratification":2,"grave":-2,"gray":-1,"great":3,"greater":3,"greatest":3,"greed":-3,"greedy":-2,"green wash":-3,"green washing":-3,"greenwash":-3,"greenwasher":-3,"greenwashers":-3,"greenwashing":-3,"greet":1,"greeted":1,"greeting":1,"greetings":2,"greets":1,"grey":-1,"grief":-2,"grieved":-2,"gross":-2,"growing":1,"growth":2,"guarantee":1,"guilt":-3,"guilty":-3,"gullibility":-2,"gullible":-2,"gun":-1,"ha":2,"hacked":-1,"haha":3,"hahaha":3,"hahahah":3,"hail":2,"hailed":2,"hapless":-2,"haplessness":-2,"happiness":3,"happy":3,"hard":-1,"hardier":2,"hardship":-2,"hardy":2,"harm":-2,"harmed":-2,"harmful":-2,"harming":-2,"harms":-2,"harried":-2,"harsh":-2,"harsher":-2,"harshest":-2,"hate":-3,"hated":-3,"haters":-3,"hates":-3,"hating":-3,"haunt":-1,"haunted":-2,"haunting":1,"haunts":-1,"havoc":-2,"healthy":2,"heartbreaking":-3,"heartbroken":-3,"heartfelt":3,"heaven":2,"heavenly":4,"heavyhearted":-2,"hell":-4,"help":2,"helpful":2,"helping":2,"helpless":-2,"helps":2,"hero":2,"heroes":2,"heroic":3,"hesitant":-2,"hesitate":-2,"hid":-1,"hide":-1,"hides":-1,"hiding":-1,"highlight":2,"hilarious":2,"hindrance":-2,"hoax":-2,"homesick":-2,"honest":2,"honor":2,"honored":2,"honoring":2,"honour":2,"honoured":2,"honouring":2,"hooligan":-2,"hooliganism":-2,"hooligans":-2,"hope":2,"hopeful":2,"hopefully":2,"hopeless":-2,"hopelessness":-2,"hopes":2,"hoping":2,"horrendous":-3,"horrible":-3,"horrific":-3,"horrified":-3,"hostile":-2,"huckster":-2,"hug":2,"huge":1,"hugs":2,"humerous":3,"humiliated":-3,"humiliation":-3,"humor":2,"humorous":2,"humour":2,"humourous":2,"hunger":-2,"hurrah":5,"hurt":-2,"hurting":-2,"hurts":-2,"hypocritical":-2,"hysteria":-3,"hysterical":-3,"hysterics":-3,"idiot":-3,"idiotic":-3,"ignorance":-2,"ignorant":-2,"ignore":-1,"ignored":-2,"ignores":-1,"ill":-2,"illegal":-3,"illiteracy":-2,"illness":-2,"illnesses":-2,"imbecile":-3,"immobilized":-1,"immortal":2,"immune":1,"impatient":-2,"imperfect":-2,"importance":2,"important":2,"impose":-1,"imposed":-1,"imposes":-1,"imposing":-1,"impotent":-2,"impress":3,"impressed":3,"impresses":3,"impressive":3,"imprisoned":-2,"improve":2,"improved":2,"improvement":2,"improves":2,"improving":2,"inability":-2,"inaction":-2,"inadequate":-2,"incapable":-2,"incapacitated":-2,"incensed":-2,"incompetence":-2,"incompetent":-2,"inconsiderate":-2,"inconvenience":-2,"inconvenient":-2,"increase":1,"increased":1,"indecisive":-2,"indestructible":2,"indifference":-2,"indifferent":-2,"indignant":-2,"indignation":-2,"indoctrinate":-2,"indoctrinated":-2,"indoctrinates":-2,"indoctrinating":-2,"ineffective":-2,"ineffectively":-2,"infatuated":2,"infatuation":2,"infected":-2,"inferior":-2,"inflamed":-2,"influential":2,"infringement":-2,"infuriate":-2,"infuriated":-2,"infuriates":-2,"infuriating":-2,"inhibit":-1,"injured":-2,"injury":-2,"injustice":-2,"innovate":1,"innovates":1,"innovation":1,"innovative":2,"inquisition":-2,"inquisitive":2,"insane":-2,"insanity":-2,"insecure":-2,"insensitive":-2,"insensitivity":-2,"insignificant":-2,"insipid":-2,"inspiration":2,"inspirational":2,"inspire":2,"inspired":2,"inspires":2,"inspiring":3,"insult":-2,"insulted":-2,"insulting":-2,"insults":-2,"intact":2,"integrity":2,"intelligent":2,"intense":1,"interest":1,"interested":2,"interesting":2,"interests":1,"interrogated":-2,"interrupt":-2,"interrupted":-2,"interrupting":-2,"interruption":-2,"interrupts":-2,"intimidate":-2,"intimidated":-2,"intimidates":-2,"intimidating":-2,"intimidation":-2,"intricate":2,"intrigues":1,"invincible":2,"invite":1,"inviting":1,"invulnerable":2,"irate":-3,"ironic":-1,"irony":-1,"irrational":-1,"irresistible":2,"irresolute":-2,"irresponsible":2,"irreversible":-1,"irritate":-3,"irritated":-3,"irritating":-3,"isolated":-1,"itchy":-2,"jackass":-4,"jackasses":-4,"jailed":-2,"jaunty":2,"jealous":-2,"jeopardy":-2,"jerk":-3,"jesus":1,"jewel":1,"jewels":1,"jocular":2,"join":1,"joke":2,"jokes":2,"jolly":2,"jovial":2,"joy":3,"joyful":3,"joyfully":3,"joyless":-2,"joyous":3,"jubilant":3,"jumpy":-1,"justice":2,"justifiably":2,"justified":2,"keen":1,"kill":-3,"killed":-3,"killing":-3,"kills":-3,"kind":2,"kinder":2,"kiss":2,"kudos":3,"lack":-2,"lackadaisical":-2,"lag":-1,"lagged":-2,"lagging":-2,"lags":-2,"lame":-2,"landmark":2,"laugh":1,"laughed":1,"laughing":1,"laughs":1,"laughting":1,"launched":1,"lawl":3,"lawsuit":-2,"lawsuits":-2,"lazy":-1,"leak":-1,"leaked":-1,"leave":-1,"legal":1,"legally":1,"lenient":1,"lethargic":-2,"lethargy":-2,"liar":-3,"liars":-3,"libelous":-2,"lied":-2,"lifesaver":4,"lighthearted":1,"like":2,"liked":2,"likes":2,"limitation":-1,"limited":-1,"limits":-1,"litigation":-1,"litigious":-2,"lively":2,"livid":-2,"lmao":4,"lmfao":4,"loathe":-3,"loathed":-3,"loathes":-3,"loathing":-3,"lobby":-2,"lobbying":-2,"lol":3,"lonely":-2,"lonesome":-2,"longing":-1,"loom":-1,"loomed":-1,"looming":-1,"looms":-1,"loose":-3,"looses":-3,"loser":-3,"losing":-3,"loss":-3,"lost":-3,"lovable":3,"love":3,"loved":3,"lovelies":3,"lovely":3,"loving":2,"lowest":-1,"loyal":3,"loyalty":3,"luck":3,"luckily":3,"lucky":3,"lugubrious":-2,"lunatic":-3,"lunatics":-3,"lurk":-1,"lurking":-1,"lurks":-1,"mad":-3,"maddening":-3,"made-up":-1,"madly":-3,"madness":-3,"mandatory":-1,"manipulated":-1,"manipulating":-1,"manipulation":-1,"marvel":3,"marvelous":3,"marvels":3,"masterpiece":4,"masterpieces":4,"matter":1,"matters":1,"mature":2,"meaningful":2,"meaningless":-2,"medal":3,"mediocrity":-3,"meditative":1,"melancholy":-2,"menace":-2,"menaced":-2,"mercy":2,"merry":3,"mess":-2,"messed":-2,"messing up":-2,"methodical":2,"mindless":-2,"miracle":4,"mirth":3,"mirthful":3,"mirthfully":3,"misbehave":-2,"misbehaved":-2,"misbehaves":-2,"misbehaving":-2,"mischief":-1,"mischiefs":-1,"miserable":-3,"misery":-2,"misgiving":-2,"misinformation":-2,"misinformed":-2,"misinterpreted":-2,"misleading":-3,"misread":-1,"misreporting":-2,"misrepresentation":-2,"miss":-2,"missed":-2,"missing":-2,"mistake":-2,"mistaken":-2,"mistakes":-2,"mistaking":-2,"misunderstand":-2,"misunderstanding":-2,"misunderstands":-2,"misunderstood":-2,"moan":-2,"moaned":-2,"moaning":-2,"moans":-2,"mock":-2,"mocked":-2,"mocking":-2,"mocks":-2,"mongering":-2,"monopolize":-2,"monopolized":-2,"monopolizes":-2,"monopolizing":-2,"moody":-1,"mope":-1,"moping":-1,"moron":-3,"motherfucker":-5,"motherfucking":-5,"motivate":1,"motivated":2,"motivating":2,"motivation":1,"mourn":-2,"mourned":-2,"mournful":-2,"mourning":-2,"mourns":-2,"mumpish":-2,"murder":-2,"murderer":-2,"murdering":-3,"murderous":-3,"murders":-2,"myth":-1,"n00b":-2,"naive":-2,"nasty":-3,"natural":1,"naïve":-2,"needy":-2,"negative":-2,"negativity":-2,"neglect":-2,"neglected":-2,"neglecting":-2,"neglects":-2,"nerves":-1,"nervous":-2,"nervously":-2,"nice":3,"nifty":2,"niggas":-5,"nigger":-5,"no":-1,"no fun":-3,"noble":2,"noisy":-1,"nonsense":-2,"noob":-2,"nosey":-2,"not good":-2,"not working":-3,"notorious":-2,"novel":2,"numb":-1,"nuts":-3,"obliterate":-2,"obliterated":-2,"obnoxious":-3,"obscene":-2,"obsessed":2,"obsolete":-2,"obstacle":-2,"obstacles":-2,"obstinate":-2,"odd":-2,"offend":-2,"offended":-2,"offender":-2,"offending":-2,"offends":-2,"offline":-1,"oks":2,"ominous":3,"once-in-a-lifetime":3,"opportunities":2,"opportunity":2,"oppressed":-2,"oppressive":-2,"optimism":2,"optimistic":2,"optionless":-2,"outcry":-2,"outmaneuvered":-2,"outrage":-3,"outraged":-3,"outreach":2,"outstanding":5,"overjoyed":4,"overload":-1,"overlooked":-1,"overreact":-2,"overreacted":-2,"overreaction":-2,"overreacts":-2,"oversell":-2,"overselling":-2,"oversells":-2,"oversimplification":-2,"oversimplified":-2,"oversimplifies":-2,"oversimplify":-2,"overstatement":-2,"overstatements":-2,"overweight":-1,"oxymoron":-1,"pain":-2,"pained":-2,"panic":-3,"panicked":-3,"panics":-3,"paradise":3,"paradox":-1,"pardon":2,"pardoned":2,"pardoning":2,"pardons":2,"parley":-1,"passionate":2,"passive":-1,"passively":-1,"pathetic":-2,"pay":-1,"peace":2,"peaceful":2,"peacefully":2,"penalty":-2,"pensive":-1,"perfect":3,"perfected":2,"perfectly":3,"perfects":2,"peril":-2,"perjury":-3,"perpetrator":-2,"perpetrators":-2,"perplexed":-2,"persecute":-2,"persecuted":-2,"persecutes":-2,"persecuting":-2,"perturbed":-2,"pesky":-2,"pessimism":-2,"pessimistic":-2,"petrified":-2,"phobic":-2,"picturesque":2,"pileup":-1,"pique":-2,"piqued":-2,"piss":-4,"pissed":-4,"pissing":-3,"piteous":-2,"pitied":-1,"pity":-2,"playful":2,"pleasant":3,"please":1,"pleased":3,"pleasure":3,"poised":-2,"poison":-2,"poisoned":-2,"poisons":-2,"pollute":-2,"polluted":-2,"polluter":-2,"polluters":-2,"pollutes":-2,"poor":-2,"poorer":-2,"poorest":-2,"popular":3,"positive":2,"positively":2,"possessive":-2,"postpone":-1,"postponed":-1,"postpones":-1,"postponing":-1,"poverty":-1,"powerful":2,"powerless":-2,"praise":3,"praised":3,"praises":3,"praising":3,"pray":1,"praying":1,"prays":1,"prblm":-2,"prblms":-2,"prepared":1,"pressure":-1,"pressured":-2,"pretend":-1,"pretending":-1,"pretends":-1,"pretty":1,"prevent":-1,"prevented":-1,"preventing":-1,"prevents":-1,"prick":-5,"prison":-2,"prisoner":-2,"prisoners":-2,"privileged":2,"proactive":2,"problem":-2,"problems":-2,"profiteer":-2,"progress":2,"prominent":2,"promise":1,"promised":1,"promises":1,"promote":1,"promoted":1,"promotes":1,"promoting":1,"propaganda":-2,"prosecute":-1,"prosecuted":-2,"prosecutes":-1,"prosecution":-1,"prospect":1,"prospects":1,"prosperous":3,"protect":1,"protected":1,"protects":1,"protest":-2,"protesters":-2,"protesting":-2,"protests":-2,"proud":2,"proudly":2,"provoke":-1,"provoked":-1,"provokes":-1,"provoking":-1,"pseudoscience":-3,"punish":-2,"punished":-2,"punishes":-2,"punitive":-2,"pushy":-1,"puzzled":-2,"quaking":-2,"questionable":-2,"questioned":-1,"questioning":-1,"racism":-3,"racist":-3,"racists":-3,"rage":-2,"rageful":-2,"rainy":-1,"rant":-3,"ranter":-3,"ranters":-3,"rants":-3,"rape":-4,"rapist":-4,"rapture":2,"raptured":2,"raptures":2,"rapturous":4,"rash":-2,"ratified":2,"reach":1,"reached":1,"reaches":1,"reaching":1,"reassure":1,"reassured":1,"reassures":1,"reassuring":2,"rebellion":-2,"recession":-2,"reckless":-2,"recommend":2,"recommended":2,"recommends":2,"redeemed":2,"refuse":-2,"refused":-2,"refusing":-2,"regret":-2,"regretful":-2,"regrets":-2,"regretted":-2,"regretting":-2,"reject":-1,"rejected":-1,"rejecting":-1,"rejects":-1,"rejoice":4,"rejoiced":4,"rejoices":4,"rejoicing":4,"relaxed":2,"relentless":-1,"reliant":2,"relieve":1,"relieved":2,"relieves":1,"relieving":2,"relishing":2,"remarkable":2,"remorse":-2,"repulse":-1,"repulsed":-2,"rescue":2,"rescued":2,"rescues":2,"resentful":-2,"resign":-1,"resigned":-1,"resigning":-1,"resigns":-1,"resolute":2,"resolve":2,"resolved":2,"resolves":2,"resolving":2,"respected":2,"responsible":2,"responsive":2,"restful":2,"restless":-2,"restore":1,"restored":1,"restores":1,"restoring":1,"restrict":-2,"restricted":-2,"restricting":-2,"restriction":-2,"restricts":-2,"retained":-1,"retard":-2,"retarded":-2,"retreat":-1,"revenge":-2,"revengeful":-2,"revered":2,"revive":2,"revives":2,"reward":2,"rewarded":2,"rewarding":2,"rewards":2,"rich":2,"ridiculous":-3,"rig":-1,"rigged":-1,"right direction":3,"rigorous":3,"rigorously":3,"riot":-2,"riots":-2,"risk":-2,"risks":-2,"rob":-2,"robber":-2,"robed":-2,"robing":-2,"robs":-2,"robust":2,"rofl":4,"roflcopter":4,"roflmao":4,"romance":2,"rotfl":4,"rotflmfao":4,"rotflol":4,"ruin":-2,"ruined":-2,"ruining":-2,"ruins":-2,"sabotage":-2,"sad":-2,"sadden":-2,"saddened":-2,"sadly":-2,"safe":1,"safely":1,"safety":1,"salient":1,"sappy":-1,"sarcastic":-2,"satisfied":2,"save":2,"saved":2,"scam":-2,"scams":-2,"scandal":-3,"scandalous":-3,"scandals":-3,"scapegoat":-2,"scapegoats":-2,"scare":-2,"scared":-2,"scary":-2,"sceptical":-2,"scold":-2,"scoop":3,"scorn":-2,"scornful":-2,"scream":-2,"screamed":-2,"screaming":-2,"screams":-2,"screwed":-2,"screwed up":-3,"scumbag":-4,"secure":2,"secured":2,"secures":2,"sedition":-2,"seditious":-2,"seduced":-1,"self-confident":2,"self-deluded":-2,"selfish":-3,"selfishness":-3,"sentence":-2,"sentenced":-2,"sentences":-2,"sentencing":-2,"serene":2,"severe":-2,"sexy":3,"shaky":-2,"shame":-2,"shamed":-2,"shameful":-2,"share":1,"shared":1,"shares":1,"shattered":-2,"shit":-4,"shithead":-4,"shitty":-3,"shock":-2,"shocked":-2,"shocking":-2,"shocks":-2,"shoot":-1,"short-sighted":-2,"short-sightedness":-2,"shortage":-2,"shortages":-2,"shrew":-4,"shy":-1,"sick":-2,"sigh":-2,"significance":1,"significant":1,"silencing":-1,"silly":-1,"sincere":2,"sincerely":2,"sincerest":2,"sincerity":2,"sinful":-3,"singleminded":-2,"skeptic":-2,"skeptical":-2,"skepticism":-2,"skeptics":-2,"slam":-2,"slash":-2,"slashed":-2,"slashes":-2,"slashing":-2,"slavery":-3,"sleeplessness":-2,"slick":2,"slicker":2,"slickest":2,"sluggish":-2,"slut":-5,"smart":1,"smarter":2,"smartest":2,"smear":-2,"smile":2,"smiled":2,"smiles":2,"smiling":2,"smog":-2,"sneaky":-1,"snub":-2,"snubbed":-2,"snubbing":-2,"snubs":-2,"sobering":1,"solemn":-1,"solid":2,"solidarity":2,"solution":1,"solutions":1,"solve":1,"solved":1,"solves":1,"solving":1,"somber":-2,"some kind":0,"son-of-a-bitch":-5,"soothe":3,"soothed":3,"soothing":3,"sophisticated":2,"sore":-1,"sorrow":-2,"sorrowful":-2,"sorry":-1,"spam":-2,"spammer":-3,"spammers":-3,"spamming":-2,"spark":1,"sparkle":3,"sparkles":3,"sparkling":3,"speculative":-2,"spirit":1,"spirited":2,"spiritless":-2,"spiteful":-2,"splendid":3,"sprightly":2,"squelched":-1,"stab":-2,"stabbed":-2,"stable":2,"stabs":-2,"stall":-2,"stalled":-2,"stalling":-2,"stamina":2,"stampede":-2,"startled":-2,"starve":-2,"starved":-2,"starves":-2,"starving":-2,"steadfast":2,"steal":-2,"steals":-2,"stereotype":-2,"stereotyped":-2,"stifled":-1,"stimulate":1,"stimulated":1,"stimulates":1,"stimulating":2,"stingy":-2,"stolen":-2,"stop":-1,"stopped":-1,"stopping":-1,"stops":-1,"stout":2,"straight":1,"strange":-1,"strangely":-1,"strangled":-2,"strength":2,"strengthen":2,"strengthened":2,"strengthening":2,"strengthens":2,"stressed":-2,"stressor":-2,"stressors":-2,"stricken":-2,"strike":-1,"strikers":-2,"strikes":-1,"strong":2,"stronger":2,"strongest":2,"struck":-1,"struggle":-2,"struggled":-2,"struggles":-2,"struggling":-2,"stubborn":-2,"stuck":-2,"stunned":-2,"stunning":4,"stupid":-2,"stupidly":-2,"suave":2,"substantial":1,"substantially":1,"subversive":-2,"success":2,"successful":3,"suck":-3,"sucks":-3,"suffer":-2,"suffering":-2,"suffers":-2,"suicidal":-2,"suicide":-2,"suing":-2,"sulking":-2,"sulky":-2,"sullen":-2,"sunshine":2,"super":3,"superb":5,"superior":2,"support":2,"supported":2,"supporter":1,"supporters":1,"supporting":1,"supportive":2,"supports":2,"survived":2,"surviving":2,"survivor":2,"suspect":-1,"suspected":-1,"suspecting":-1,"suspects":-1,"suspend":-1,"suspended":-1,"suspicious":-2,"swear":-2,"swearing":-2,"swears":-2,"sweet":2,"swift":2,"swiftly":2,"swindle":-3,"swindles":-3,"swindling":-3,"sympathetic":2,"sympathy":2,"tard":-2,"tears":-2,"tender":2,"tense":-2,"tension":-1,"terrible":-3,"terribly":-3,"terrific":4,"terrified":-3,"terror":-3,"terrorize":-3,"terrorized":-3,"terrorizes":-3,"thank":2,"thankful":2,"thanks":2,"thorny":-2,"thoughtful":2,"thoughtless":-2,"threat":-2,"threaten":-2,"threatened":-2,"threatening":-2,"threatens":-2,"threats":-2,"thrilled":5,"thwart":-2,"thwarted":-2,"thwarting":-2,"thwarts":-2,"timid":-2,"timorous":-2,"tired":-2,"tits":-2,"tolerant":2,"toothless":-2,"top":2,"tops":2,"torn":-2,"torture":-4,"tortured":-4,"tortures":-4,"torturing":-4,"totalitarian":-2,"totalitarianism":-2,"tout":-2,"touted":-2,"touting":-2,"touts":-2,"tragedy":-2,"tragic":-2,"tranquil":2,"trap":-1,"trapped":-2,"trauma":-3,"traumatic":-3,"travesty":-2,"treason":-3,"treasonous":-3,"treasure":2,"treasures":2,"trembling":-2,"tremulous":-2,"tricked":-2,"trickery":-2,"triumph":4,"triumphant":4,"trouble":-2,"troubled":-2,"troubles":-2,"true":2,"trust":1,"trusted":2,"tumor":-2,"twat":-5,"ugly":-3,"unacceptable":-2,"unappreciated":-2,"unapproved":-2,"unaware":-2,"unbelievable":-1,"unbelieving":-1,"unbiased":2,"uncertain":-1,"unclear":-1,"uncomfortable":-2,"unconcerned":-2,"unconfirmed":-1,"unconvinced":-1,"uncredited":-1,"undecided":-1,"underestimate":-1,"underestimated":-1,"underestimates":-1,"underestimating":-1,"undermine":-2,"undermined":-2,"undermines":-2,"undermining":-2,"undeserving":-2,"undesirable":-2,"uneasy":-2,"unemployment":-2,"unequal":-1,"unequaled":2,"unethical":-2,"unfair":-2,"unfocused":-2,"unfulfilled":-2,"unhappy":-2,"unhealthy":-2,"unified":1,"unimpressed":-2,"unintelligent":-2,"united":1,"unjust":-2,"unlovable":-2,"unloved":-2,"unmatched":1,"unmotivated":-2,"unprofessional":-2,"unresearched":-2,"unsatisfied":-2,"unsecured":-2,"unsettled":-1,"unsophisticated":-2,"unstable":-2,"unstoppable":2,"unsupported":-2,"unsure":-1,"untarnished":2,"unwanted":-2,"unworthy":-2,"upset":-2,"upsets":-2,"upsetting":-2,"uptight":-2,"urgent":-1,"useful":2,"usefulness":2,"useless":-2,"uselessness":-2,"vague":-2,"validate":1,"validated":1,"validates":1,"validating":1,"verdict":-1,"verdicts":-1,"vested":1,"vexation":-2,"vexing":-2,"vibrant":3,"vicious":-2,"victim":-3,"victimize":-3,"victimized":-3,"victimizes":-3,"victimizing":-3,"victims":-3,"vigilant":3,"vile":-3,"vindicate":2,"vindicated":2,"vindicates":2,"vindicating":2,"violate":-2,"violated":-2,"violates":-2,"violating":-2,"violence":-3,"violent":-3,"virtuous":2,"virulent":-2,"vision":1,"visionary":3,"visioning":1,"visions":1,"vitality":3,"vitamin":1,"vitriolic":-3,"vivacious":3,"vociferous":-1,"vulnerability":-2,"vulnerable":-2,"walkout":-2,"walkouts":-2,"wanker":-3,"want":1,"war":-2,"warfare":-2,"warm":1,"warmth":2,"warn":-2,"warned":-2,"warning":-3,"warnings":-3,"warns":-2,"waste":-1,"wasted":-2,"wasting":-2,"wavering":-1,"weak":-2,"weakness":-2,"wealth":3,"wealthy":2,"weary":-2,"weep":-2,"weeping":-2,"weird":-2,"welcome":2,"welcomed":2,"welcomes":2,"whimsical":1,"whitewash":-3,"whore":-4,"wicked":-2,"widowed":-1,"willingness":2,"win":4,"winner":4,"winning":4,"wins":4,"winwin":3,"wish":1,"wishes":1,"wishing":1,"withdrawal":-3,"woebegone":-2,"woeful":-3,"won":3,"wonderful":4,"woo":3,"woohoo":3,"wooo":4,"woow":4,"worn":-1,"worried":-3,"worry":-3,"worrying":-3,"worse":-3,"worsen":-3,"worsened":-3,"worsening":-3,"worsens":-3,"worshiped":3,"worst":-3,"worth":2,"worthless":-2,"worthy":2,"wow":4,"wowow":4,"wowww":4,"wrathful":-3,"wreck":-2,"wrong":-2,"wronged":-2,"wtf":-4,"yeah":1,"yearning":1,"yeees":2,"yes":1,"youthful":2,"yucky":-2,"yummy":3,"zealot":-2,"zealots":-2,"awards":3});

require.register("wooorm~retext-visit@0.1.1", function (exports, module) {
'use strict';

/**
 * Define `plugin`.
 */

function plugin() {}

/**
 * Invoke `callback` for every descendant of the
 * operated on context.
 *
 * @param {function(Node): boolean?} callback - Visitor.
 *   Stops visiting when the return value is `false`.
 * @this {Node} Context to search in.
 */

function visit(callback) {
    var node,
        next;

    node = this.head;

    while (node) {
        /**
         * Allow for removal of the node by `callback`.
         */

        next = node.next;

        if (callback(node) === false) {
            return;
        }

        /**
         * If possible, invoke the node's own `visit`
         *  method, otherwise call retext-visit's
         * `visit` method.
         */

        (node.visit || visit).call(node, callback);

        node = next;
    }
}

/**
 * Invoke `callback` for every descendant with a given
 * `type` in the operated on context.
 *
 * @param {string} type - Type of a node.
 * @param {function(Node): boolean?} callback - Visitor.
 *   Stops visiting when the return value is `false`.
 * @this {Node} Context to search in.
 */

function visitType(type, callback) {
    /**
     * A wrapper for `callback` to check it the node's
     * type property matches `type`.
     *
     * @param {node} type - Descendant.
     * @return {*} Passes `callback`s return value
     *   through.
     */

    function wrapper(node) {
        if (node.type === type) {
            return callback(node);
        }
    }

    this.visit(wrapper);
}

function attach(retext) {
    var TextOM,
        parentPrototype,
        elementPrototype;

    TextOM = retext.TextOM;
    parentPrototype = TextOM.Parent.prototype;
    elementPrototype = TextOM.Element.prototype;

    /**
     * Expose `visit` and `visitType` on Parents.
     *
     * Due to multiple inheritance of Elements (Parent
     * and Child), these methods are explicitly added.
     */

    elementPrototype.visit = parentPrototype.visit = visit;
    elementPrototype.visitType = parentPrototype.visitType = visitType;
}

/**
 * Expose `attach`.
 */

plugin.attach = attach;

/**
 * Expose `plugin`.
 */

exports = module.exports = plugin;

});

require.register("wooorm~retext-sentiment@0.1.1", function (exports, module) {
'use strict';

/**
 * Dependencies.
 */

var afinn,
    visit;

afinn = require("wooorm~afinn-111@0.1.0");
visit = require("wooorm~retext-visit@0.1.1");

/**
 * Constants.
 */

var has,
    NEUTRAL,
    POSITIVE,
    NEGATIVE;

has = Object.prototype.hasOwnProperty;

NEUTRAL = 'neutral';
POSITIVE = 'positive';
NEGATIVE = 'negative';

/**
 * Classify, from a given `polarity` between `-5` and
 * `5`, if the polarity is `NEGATIVE` (negative),
 * `NEUTRAL` (0), or `POSITIVE` (positive).
 *
 * @param {number} polarity
 * @return {string}
 */

function classify(polarity) {
    return polarity > 0 ? POSITIVE : polarity < 0 ? NEGATIVE : NEUTRAL;
}

/**
 * Handler for a polarity change in a `parent`.
 *
 * @param {Parent} parent
 * @param {number} substract - Ammount subtract.
 * @param {number} add - Ammount add.
 */

function onchangeinparent(parent, substract, add) {
    var polarity,
        data;

    if (!parent) {
        return;
    }

    data = parent.data;

    if (has.call(data, 'polarity')) {
        polarity = data.polarity;
    } else {
        polarity = 0;
    }

    polarity = polarity - substract + add;

    data.polarity = polarity;
    data.valence = classify(polarity);

    onchangeinparent(parent.parent, substract, add);
}

/**
 * Handler for a value change in a `node`.
 *
 * @param {WordNode} node
 */

function onchange(node) {
    var data,
        polarity,
        value;

    data = node.data;
    polarity = 0;
    value = node.toString().toLowerCase();

    if (has.call(afinn, value)) {
        polarity = afinn[value];
    }

    data.polarity = polarity;
    data.valence = classify(polarity);
}

/**
 * Handler for a value change in an attached word.
 *
 * @this {WordNode}
 */

function onchangetext() {
    var self,
        previousPolarity;

    self = this;
    previousPolarity = self.data.polarity;

    onchange(self);

    onchangeinparent(self.parent, previousPolarity, self.data.polarity);
}

/**
 * Handler for a node's deletion.
 *
 * @param {Parent} previousParent
 * @this {WordNode}
 */

function onremove(previousParent) {
    if (!has.call(this.data, 'polarity')) {
        return;
    }

    onchangeinparent(previousParent, this.data.polarity, 0);
}

/**
 * Handler for a node's insertion.
 *
 * @this {WordNode}
 */

function oninsert() {
    var self = this;

    if (!has.call(self.data, 'polarity')) {
        onchange(self);
    }

    onchangeinparent(self.parent, 0, self.data.polarity);
}

/**
 * Define `sentiment`.
 *
 * @param {Node} tree
 */

function sentiment(tree) {
    tree.visitType(tree.SENTENCE_NODE, function (sentenceNode) {
        onchangeinparent(sentenceNode.parent, 0, sentenceNode.data.polarity);
    });
}

/**
 * Define `attach`.
 *
 * @param {Retext} retext
 */

function attach(retext) {
    var TextOM;

    TextOM = retext.TextOM;

    retext.use(visit);

    TextOM.WordNode.on('changetextinside', onchangetext);
    TextOM.WordNode.on('removeinside', onchangetext);
    TextOM.WordNode.on('insertinside', onchangetext);
    TextOM.WordNode.on('insert', oninsert);
    TextOM.Node.on('remove', onremove);
}

/**
 * Expose `attach`.
 */

sentiment.attach = attach;

/**
 * Expose `sentiment`.
 */

module.exports = sentiment;

});

require.register("raynos~date-now@v1.0.1", function (exports, module) {
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

});

require.register("component~debounce@1.0.0", function (exports, module) {

/**
 * Module dependencies.
 */

var now = require("raynos~date-now@v1.0.1");

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

});

require.register("wooorm~retext-dom@0.1.3", function (exports, module) {
'use strict';

var visit;

/**
 * Module dependencies.
 */

visit = require("wooorm~retext-visit@0.1.1");

/**
 * Throw when not running in the browser (or a
 * simulated browser environment).
 */

/* istanbul ignore if */
if (typeof document !== 'object') {
    throw new Error(
        'Missing document object for `retext-dom`.'
    );
}

/**
 * Event handler for an inserted TextOM node.
 *
 * @param {Node} node - Insertion.
 */

function oninsertinside(node) {
    node.parent.toDOMNode().insertBefore(node.toDOMNode(),
        node.prev ? node.prev.toDOMNode().nextSibling : null
    );
}

/**
 * Event handler for a removed TextOM node.
 *
 * @param {Node} node - Deletion.
 */

function onremoveinside(node, previousParent) {
    previousParent.toDOMNode().removeChild(node.toDOMNode());
}

/**
 * Event handler for a value-change in a TextOM text
 * node.
 *
 * @param {Node} node - Changed node.
 */

function onchangetextinside(node, newValue) {
    node.toDOMNode().textContent = newValue;
}

/**
 * Get the DOM node-equivalent from a TextOM node.
 *
 * On initial run, a DOM node is created. If a
 * `DOMTagName` property exists on the context
 * a DOM text node is created. Otherwise, an
 * DOM element is created of type `DOMTagName`.
 *
 *
 * @this {Node}
 * @return {Node} DOM node.
 */

function toDOMNode() {
    var self,
        DOMNode;

    self = this;
    DOMNode = self.DOMNode;

    if (!DOMNode) {
        if (!self.DOMTagName) {
            DOMNode = document.createTextNode('');
        } else {
            DOMNode = document.createElement(self.DOMTagName);
        }

        /**
         * Store DOM node on context.
         */

        self.DOMNode = DOMNode;

        /**
         * Store context on DOM node.
         */

        DOMNode.TextOMNode = self;
    }

    return DOMNode;
}

/**
 * Define `plugin`.
 *
 * @param {Node} tree - TextOM node.
 */

function plugin(tree) {
    tree.on('insertinside', oninsertinside);
    tree.on('removeinside', onremoveinside);
    tree.on('changetextinside', onchangetextinside);

    /**
     * Make sure a parent DOM node, to attach to,
     * exists.
     */

    tree.toDOMNode();

    tree.visit(function (node) {
        oninsertinside(node);

        if (node instanceof node.TextOM.Text) {
            onchangetextinside(node, node.toString(), null);
        }
    });
}

/**
 * Define `attach`.
 *
 * @param {Retext} retext - Instance of Retext.
 */

function attach(retext) {
    var TextOM;

    /**
     * Depend on `retext-visit`.
     */

    retext.use(visit);

    TextOM = retext.TextOM;

    TextOM.Node.prototype.toDOMNode = toDOMNode;

    TextOM.Node.prototype.DOMTagName = 'span';
    TextOM.RootNode.prototype.DOMTagName = 'div';
    TextOM.ParagraphNode.prototype.DOMTagName = 'p';

    TextOM.Text.prototype.DOMTagName = null;
}

/**
 * Expose `attach`.
 */

plugin.attach = attach;

/**
 * Expose `plugin`.
 */

module.exports = plugin;

});

require.register("retext-sentiment-gh-pages", function (exports, module) {
var Retext = require("wooorm~retext@0.2.0-rc.3");
var sentiment = require("wooorm~retext-sentiment@0.1.1");
var DOM = require("wooorm~retext-dom@0.1.3");
var visit = require("wooorm~retext-visit@0.1.1");

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

});

require("retext-sentiment-gh-pages")
