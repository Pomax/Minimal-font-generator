/**
 * FontGen.js -- a tiny font generator, forming TTF fonts with a
 * single zero-width character implemented, written by Mike "Pomax"
 * Kamermans, with the help of some functions that implement the
 * PHP functions that the original PHP code relied on.
 *
 * LICENSE INFORMATION
 *
 * This code is (c) Mike "Pomax" Kamermans [2012] but is
 * released under the MIT ("expat" flavour) license.
 **/

// we're going to hand-craft the hell out of this font =P
TinyFontGenerator = {

  /**
   * table ordering (ASCII-sorted, rather than alpha)
   */
  ordering: ["OS/2", "cmap", "glyf", "head", "hhea", "hmtx", "loca", "maxp", "name", "post"],

  /**
   * See http://phpjs.org/functions/dechex:382
   */
  dechex: function(number) {
    if (number < 0) { number = 0xFFFFFFFF + number + 1; }
    return parseInt(number, 10).toString(16);
  },

  /**
   * Shorthand hexdec() function
   */
  hexdec: function(hex) {
    return parseInt(hex, 16);
  },

  /**
   * Shorthand chr() function. 
   */
  chr: function(number) { return String.fromCharCode(number); },

  /**
   * See http://phpjs.org/functions/ord:483
   */
  ord: function(string) {
    var str = string + '', code = str.charCodeAt(0);
    if (0xD800 <= code && code <= 0xDBFF) { // High surrogate
      var hi = code;
      if (str.length === 1) { return code; }
      var low = str.charCodeAt(1);
      return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000; }
    if (0xDC00 <= code && code <= 0xDFFF) { return code; } // Low surrogate
    return code;
  },

  /**
   * shorthand helper for turning a hex string into a byte
   */
  asByte: function(val) {
    return this.chr(this.hexdec(val));
  },

  /**
   * simplified pack('N',num)
   */
  toULONG: function(num) {
    result = "";
    result += this.chr(num >> 24 & 0xFF);
    result += this.chr(num >> 16 & 0xFF);
    result += this.chr(num >> 8 & 0xFF);
    result += this.chr(num & 0xFF);
    return result;
  },

  /**
   * Turn string data into byte code
   */
  convertData: function(data) {
    var buffer = "";
    data = data.replace(/\s+/g," ").trim().split(" ");
    // convert from string to byte code
    for(var bt=0, e=data.length; bt<e; bt++) {
      buffer += this.asByte(data[bt].trim()); }
    // ensure the data is long-aligned
    while(buffer.length%4!=0) { buffer += this.chr(0); }
    // return the bytecode data
    return buffer;
  },
  
  /**
   * Compute the LONG checksum for a data block
   */
  computeChecksum: function(data) {
    // we don't actually care about checksums =)
    return this.chr(0) + this.chr(0) + this.chr(0) + this.chr(0);
  },

  /**
   * IE9 does not have binary-to-ascii built in O_O
   */
  btoa: function(data) {
    if(window.btoa) {
      return window.btoa(data);
    } else {
      // see http://phpjs.org/functions/base64_encode:358
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
      if (!data) { return data; }
      do { // pack three octets into four hexets
          o1 = data.charCodeAt(i++);
          o2 = data.charCodeAt(i++);
          o3 = data.charCodeAt(i++);
          bits = o1 << 16 | o2 << 8 | o3;
          h1 = bits >> 18 & 0x3f;
          h2 = bits >> 12 & 0x3f;
          h3 = bits >> 6 & 0x3f;
          h4 = bits & 0x3f;
          // use hexets to index into b64, and append result to encoded string
          tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
      } while (i < data.length);
      enc = tmp_arr.join('');
      var r = data.length % 3;
      return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    }
  },

  // ------ TABLE DEFINITIONS ------

  // table data - do not access these values directly, use get[...] instead
  OS2data: false,
  CMAPdata: false, codedCharacter: false,
  GLYFdata: false,
  HEADdata: false,
  HHEAdata: false,
  HMTXdata: false,
  LOCAdata: false,
  MAXPdata: false,
  NAMEdata: false,
  POSTdata: false,

  /**
   * Get the OS/2 table data, or set it up if it doesn't exist yet.
   */ 
  getOS2Data : function() {
    if(this.OS2data!==false) { return this.OS2data; }

    var data = "";
    data += " 00 04";  // The current (Jan 2012) OS/2 table version is 4
    data += " 00 01";  // xAvgCharWidth
    data += " 00 64";  // weight class: 100 ("thin")
    data += " 00 01";  // width class: 1 ("ultra condensed")
    data += " 00 00";  // fsType: Installable Embedding  

    data += " 00 00";  // subscript sizes are irrelevant
    data += " 00 00";  //   "
    data += " 00 00";  //   "
    data += " 00 00";  //   "
    data += " 00 00";  // superscript sizes are irrelevant
    data += " 00 00";  //   "
    data += " 00 00";  //   "
    data += " 00 00";  //   "
    data += " 00 00";  // strikeout values are irrelevant
    data += " 00 00";  //   "
    
    data += " 00 00";  // sfamilyclass - this is 0000 because this font will not be publically catalogued

    data += " 00 00 00 00 00 00 00 00 00 00"; // panose bytes - we set all of these to 0, because this font will not be publically catalogued

    data += " 00 00 00 00";  // ulUnicodeRange 1 (if browsers supported OS/2 v0, we wouldn't need this field)
    data += " 00 00 00 00";  // ulUnicodeRange 2 (idem dito)
    data += " 00 00 00 00";  // ulUnicodeRange 3 (idem)
    data += " 00 00 00 00";  // ulUnicodeRange 4 (idem)

    data += " 00 00 00 00";  // vendor ID - we set this to 0x00000000 because this font will not be publically catalogued
    data += " 00 00";  // font indicator bits - we set this to 0x0000 because this font will not be publically catalogued

    data += " 00 00";  // first character index - for "real" fonts this would correspond to the first CMAP entry
    data += " 00 00";  // last character index  - for "real" fonts this would correspond to the last CMAP entry

    data += " 00 00";  // typographical ascender value
    data += " 00 00";  // typographical descender value
    data += " 00 00";  // typographical linegap value

    data += " 01 00";  // usWinAscent.
    
    /*
      Note: any value for usWinAscent below 0x0100 breaks Opera, I do not know why.
      The OpenType documentation states this:
      
        "For platform 3 encoding 0 fonts, it is the same as yMax"
      
      But in this font, yMax is 0x0000, and the value seems tied to xMax instead.
      However, changing both of these so that they match still leads to Opera
      refusing to load the font if the value is below 0x0100...
    */
    
    data += " 00 00";  // usWinDescent. 
    data += " 00 00 00 00";  // ulCodePageRange 1 (if browsers supported OS/2 v0, we wouldn't need this field)
    data += " 00 00 00 00";  // ulCodePageRange 2 (idem dito)
    this.OS2data = this.convertData(data);
    return this.OS2data;
  },
  
  /**
   * Get the CMAP table data, or set it up if it doesn't exist yet.
   */
  getCMAPData : function(charnum, hexchar) {
    if(this.CMAPdata!==false && this.codedCharacter===hexchar) { return this.CMAPdata; }
    this.codedCharacter = hexchar;

    var data = "";

    data += " 00 00";        // CMAP table format 0
    data += " 00 01";        // we only have one subtable

    // what are we coding for?
    data += " 00 03";        // platform: 3 (Windows)
    data += " 00 01";        // encoding: 1 (Unicode)
    data += " 00 00 00 0C";  // subtable offset: 12 bytes from start of data block

    // We'll use a format 4 subtable, since OTS currently rejects any other subtable format
    // (hopefully this will change in the future because that's a VERY severe restriction)
    data += " 00 04";
    data += " 00 20";        // table length: 32 byte
    data += " 00 00";
    data += " 00 04";        // segCount x 2
    data += " 00 04";        // Note: even though knowing segCount means searchRange can be computed by the engine,
                             //       setting it to a wrong value breaks Chrome and Firefox
    data += " 00 01";        // idem dito for entrySelector
    data += " 00 00";

    // actual character information
    data += " " + hexchar + " FF FF"; // end character codes in each segment range
    data += " 00 00";
    data += " " + hexchar + " FF FF"; // start character codes in each segment range

    // Make sure we get the correct idDelta value. Because our "glyph"
    // is always at index 1 (index 0 is reserved for .notdef) we need
    // to set up the delta value such that <character code> + <delta> == 1
    var corrective = -(charnum - 1) + 65536;
    var idDelta = this.dechex(corrective);
    data += " "+idDelta[0] + idDelta[1] + " " + idDelta[2] + idDelta[3];

    // Of course, there are two values in this segment: the real
    // glyph, and the terminator 0xFFFF. The idDelta for 0xFFFF
    // must be 1.
    data += " 00 01";

    // We do not need to work with idRangeOffset (THANK GOD!), so
    // the idRangeOffset values are 0 for both segment entries.
    data += " 00 00 00 00";

    this.CMAPdata = this.convertData(data);
    return this.CMAPdata;
  },
  
  /**
   * Get the GLYF table data, or set it up if it doesn't exist yet.
   */
  getGLYFData : function() {
    if(this.GLYFdata!==false) { return this.GLYFdata; }
    var data = "";

    // glyph 1: .notdef
    data += " 00 01";         // simple glyph
    data += " 00 00  00 00";  // x/y min
    data += " 00 00  00 00";  // y/x max
    data += " 00 00";         // end point(s): coordinate 0 is the last point in the path
    data += " 00 00";         // instructions: there are no TTF instructions
    /*
      Outline flags for the only point in the glyph:

       1  coordinate represents an on-curve point
       0  x coordinate is encoded as SHORT
       0  y coordinate is encoded as SHORT
       1  x coordinate is 'same as last', which for the first coordinate means it's zero.
       1  y coordinate is also 'same as last'
       0  reserved
       0  reserved
    */
    data += " 31";
    data += " 00"; // padding byte to make sure the table is LONG aligned

    this.GLYFdata = this.convertData(data);
    return this.GLYFdata;
  },
  
  /**
   * Get the HEAD table data, or set it up if it doesn't exist yet.
   */
  getHEADData : function() {
    if(this.HEADdata!==false) { return this.HEADdata; }
    var data  = "";

    data += " 00 01 00 00";  // table version
    data += " 00 00 00 00";  // font revision 0
    data += " 00 00 00 00";  // as this font will never be installed, its checksum is irrelevant
    data += " 5F 0F 3C F5";  // even though the TTF magic number is fixed, we HAVE to include it =(
    data += " 00 00";        // special flags: we do not care about them
    data += " 20 00";        // EM quad size of 8192 - any higher and Opera breaks
    data += " 00 00 00 00 00 00 00 00"; // Number of seconds since 12:00 midnight, January 1, 1904 (64-bit integer)
    data += " 00 00 00 00 00 00 00 00"; // idem dito
    data += " 00 00";        // xmin
    data += " 00 00";        // ymin
    data += " 01 00";        // xMax for this font. For some reason, Opera breaks when this value is lower than 0x0100
    data += " 00 00";        // ymax
    data += " 00 00";        // macstyle - irrelevant, because this font will never be catalogued
    data += " 00 01";        // smallest readable size in pixels: one.
    data += " 00 02";        // (fontDirectionHint is deprecated and should be 2)
    data += " 00 00";        // indices for the LOCA data are encoded as SHORT, rather than LONG (which is 0x0001)
    data += " 00 00";        // use "current" glyph data format

    this.HEADdata = this.convertData(data);
    return this.HEADdata;
  },

  /**
   * Get the HEAD table data, or set it up if it doesn't exist yet.
   */
  getHHEAData : function() {
    if(this.HHEAdata!==false) { return this.HHEAdata; }

    var data = "";
    data += " 00 01 00 00";  // table version
    data += " 00 01";        // typographical ascender
    data += " 00 00";        // typographical descender
    data += " 00 01";        // typographical line gap
    data += " 00 00";        // advanceWidthMax
    data += " 00 00";        // minimum LSB
    data += " 00 00";        // minimum RSB
    data += " 00 00";        // Max(lsb + (xMax - xMin))
    data += " 00 00";        // caretSlopeRise
    data += " 00 00";        // caretSlopeRun
    data += " 00 00";        // caretOffset
    data += " 00 00";        // must be 0
    data += " 00 00";        //  "
    data += " 00 00";        //  "
    data += " 00 00";        //  "
    data += " 00 00";        // use "current" metric data format
    data += " 00 01";        // number of hmetrics

    this.HHEAdata = this.convertData(data);
    return this.HHEAdata;
  },

  /**
   * Get the HMTX table data, or set it up if it doesn't exist yet.
   */
  getHMTXData : function() {
    if(this.HMTXdata!==false) { return this.HMTXdata; }

    var data = "";
    /*
      First, an array of {advanceWidth,	lsb} values, encoded as {USHORT,SHORT}.
      There is only one value here, as per the hmetric value from the HHEA table
    */
    data += " 00 00";
    data += " 00 00";
    /*
      Then, a SHORT[n] for leftSideBearing values, with n being: (maxp.numGlyphs - hhea.hmetrics) = (2-1) = 1
      Since side bearings are meaningless for this minimal font, we set it to 0.
    */
    data += " 00 00";

    this.HMTXdata = this.convertData(data);
    return this.HMTXdata;
  },

  /**
   * Get the LOCA table data, or set it up if it doesn't exist yet.
   */
  getLOCAData : function() {
    if(this.LOCAdata!==false) { return this.LOCAdata; }

    var data = "";
    data += " 00 00";        // location for .notdef: no glyph
    data += " 00 00";        // location for our custom character: also no glyph
    data += " 00 08";        // end of GLYF table: 16 bytes [encoded value '8'], although I don't know why we need this value, as the font engine can get this value from the SFNT 'glyf' tag.

    this.LOCAdata = this.convertData(data);
    return this.LOCAdata;
  },
  
  /**
   * Get the MAXP table data, or set it up if it doesn't exist yet.
   */
  getMAXPData : function() {
    if(this.MAXPdata!==false) { return this.MAXPdata; }

    var data = "";
    data += " 00 01 00 00";  // table version must be 0x00010000 for TTF (CFF uses 0x00005000)
    data += " 00 02";        // two 'glyphs'; .notdef and our custom character
    data += " 00 01";        // contours have at most one point.
    data += " 00 01";        // glyphs have at most one contour.
    data += " 00 00";        // maximum number of points in composite glyphs = zero, because there are no composite glyphs
    data += " 00 00";        // maximum number of contours in composite glyphs = zero, because there are no composite glyphs
    data += " 00 02";        // max_zones should be either 0x0001 ("uses twilight zone") or 0x0002 ("does not use twilight zone"). This is relevant for TTF instructions only
    data += " 00 00";        // maxTwilightPoints is zero
    data += " 00 00";        // Number of Storage Area locations
    data += " 00 00";        // Number of FDEFs
    data += " 00 00";        // Number of IDEFs
    data += " 00 00";        // Maximum stack depth
    data += " 00 00";        // Maximum byte count for glyph instructions
    data += " 00 00";        // Maximum number of components referenced at “top level” for any composite glyph
    data += " 00 00";        // Maximum level of recursion

    this.MAXPdata = this.convertData(data);
    return this.MAXPdata;
  },

  /**
   * Get the MAXP table data, or set it up if it doesn't exist yet.
   */
  getNAMEData : function() {
    if(this.NAMEdata!==false) { return this.NAMEdata; }
    var data = "";
    data += " 00 00";
    data += " 00 02";        // two entries
    data += " 00 1E";        // offset for the string heap
    data += " 00 03  00 01  04 09  00 01  00 00  00 00"; // windows font family name entry
    data += " 00 03  00 01  04 09  00 02  00 02  00 00"; // windows font subfamily name entry
    // string heap
    data += " 00 00";
    this.NAMEdata = this.convertData(data);
    return this.NAMEdata;
  },
  
  /**
   * Get the POST table data, or set it up if it doesn't exist yet.
   */
  getPOSTData : function() {
    if(this.POSTdata!==false) { return this.POSTdata; }

    var data = ""; 
    data += " 00 01 00 00";  // version 1
    data += " 00 00 00 00";  // italicAngle
    data += " 00 00 00 00";  // underlinePosition
    data += " 00 00 00 00";  // underlineThickness
    this.POSTdata = this.convertData(data);
    return this.POSTdata;
  },

  /**
   * Generate the minimal font for our desired character
   */
  generateFont: function(character) {
    var tables = {}, font="";

    // convert the provided character to its hex code
    // equivalent, taking spacing into account.
    var charnum = this.ord(character);
    var hexchar = this.dechex(charnum);
    if(hexchar.length==2) {
      hexchar = "00 "+hexchar;
    } else if(hexchar.length==4) {
      hexchar = hexchar.substring(0,2) + " " + hexchar.substring(2,4);
    }

    tables["OS/2"] = this.getOS2Data();
    tables["cmap"] = this.getCMAPData(charnum, hexchar);
    tables["glyf"] = this.getGLYFData();
    tables["head"] = this.getHEADData();
    tables["hhea"] = this.getHHEAData();
    tables["hmtx"] = this.getHMTXData();
    tables["loca"] = this.getLOCAData();
    tables["maxp"] = this.getMAXPData();
    tables["name"] = this.getNAMEData();
    tables["post"] = this.getPOSTData();

    // Write the spline font (SFNT) header
    font  = this.chr(0) + this.chr(1) + this.chr(0) + this.chr(0);  // TrueType format font = 0x0100 (CFF would be 'OTTO')
    font += this.chr(0) + this.chr(10);  // 10 tables
    font += this.chr(0) + this.chr(128); // search range   (determined by table count)
    font += this.chr(0) + this.chr(3);   // entry selector (determined by table count)
    font += this.chr(0) + this.chr(32);  // range shift    (determined by table count)

    // Write the OpenType table definitions
    var ordering = this.ordering, // local alias
        olen = ordering.length,    // length of table ordering
        offset = 12 + 16*olen,     // offset tracker for table offset values
        tablename,                 // iteration value
        len;                       // iteration value
    for(var i=0; i<olen; i++) {
      tablename = ordering[i];
      len = tables[tablename].length;
      font += tablename;
      font += this.computeChecksum(tables[tablename]);  // table checksum
      font += this.toULONG(offset);                     // offset for this table
      font += this.toULONG(len);                        // table length
      offset += len;
    }

    // Finally, write the actual table data blocks
    for(var i=0; i<olen; i++) { font += tables[ordering[i]]; }

    // return this font as a glorious base64 encoded string
    return this.btoa(font);
  }
}