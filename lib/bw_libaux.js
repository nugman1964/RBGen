function clone(obj)
{
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
  }
  return copy;
}

// Convert a given hash to an array with Name/Value pairs.
// Input (Param): {xyz:'abc'}
// Output:        {Name:'xyz', Value:'abc'}
function Param2NameValueArray(Param)
{
  var ResArray = [];
  if (typeof(Param) == 'object') {
    if (Array.isArray(Param)) {
      ResArray = Param;
    } else {
      for (var KeyName in Param)
        ResArray.push({Name:KeyName,Value:Param[KeyName]});
    }
  }
  return ResArray;
}

function TestArray()
{
  console.log('[AUX] TestArray() ...');
  var TestArray = ['abc','xyz'];
  var sTestArray = '["abc","xyz"]';
  console.log('[AUX] Array.isArray('+sTestArray+')='+Array.isArray(TestArray)+';'+"\n"
             +'      typeof('+sTestArray+')='+typeof(TestArray));
  for (var k in TestArray)
    console.log('[AUX] TestArray: k='+k+'; TestArray['+k+']='+TestArray[k]);

  var TestHash = {var1: 'xyz', var2: 'abc'};
  var sTestHash = '{var1: "xyz", var2: "abc"}';
  console.log('[AUX] Array.isArray('+sTestHash+')='+Array.isArray(TestHash)+';'+"\n"
             +'      typeof('+sTestHash+')='+typeof(TestHash));
  for (var k in TestHash)
    console.log('[AUX] TestHash: k='+k+'; TestHash['+k+']='+TestHash[k]);

  var TestHashArray = [{VarA:'ABC',VarB:'123'},{VarA:'XYZ',VarB:'789'}];
  var sTestHashArray = '[{VarA:"ABC",VarB:"123"},{VarA:"XYZ",VarB:"789"}]';
  console.log('[AUX] Array.isArray('+sTestHashArray+')='+Array.isArray(TestHashArray)+';'+"\n"
             +'      typeof('+sTestHashArray+')='+typeof(TestHashArray));
  for (var k in TestHashArray)
    console.log('[AUX] TestHashArray: k='+k+'; TestHashArray['+k+']='+TestHashArray[k]);
}

//TestArray();

function isNumeric(n)
{
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isString(v)
{
  return (GetVarType(v) == 'string')
}

function isNumber(v)
{
  return (GetVarType(v) == 'number')
}

function isArray(v)
{
  return (GetVarType(v) == 'array')
}

function isBool(v)
{
  return (GetVarType(v) == 'boolean')
}

function isFunction(v)
{
  return (typeof(v) === 'function')
}

function GetVarType(v)
{
  var sVarType = '';
  if ((typeof(v) === 'number') || (v instanceof Number))
    sVarType = 'number';
  if ((typeof(v) === 'string') || (v instanceof String))
    sVarType = 'string';
  if ((typeof(v) === 'array') || (v instanceof Array))
    sVarType = 'array';
  if ((typeof(v) === 'boolean') || (v instanceof Boolean))
    sVarType = 'boolean';
  //console.log('[AUX] GetVarType('+v+'): '+sVarType)
  return sVarType;
}

function TestType()
{
  console.log('[AUX] TestType() ...');
  var TestNum = [{TypeStr:'Pos. Number 1234',Value:1234},
                 {TypeStr:'String "1234"',Value:'1234'},
                 {TypeStr:'Neg. Number -1234',Value:-1234},
                 {TypeStr:'String "-1234"',Value:'-1234'},
                 {TypeStr:'Number zero',Value:0},
                 {TypeStr:'String "0"',Value:'0'},
                 {TypeStr:'Float 1.234',Value:1.234},
                 {TypeStr:'String "1.234"',Value:'1.234'},
                 {TypeStr:'String "1,234"',Value:'1,234'},
                 {TypeStr:'Neg. Float -1.234',Value:-1.234},
                 {TypeStr:'String "-1.234"',Value:'-1.234'},
                 {TypeStr:'String "-1,234"',Value:'-1,234'},
                 {TypeStr:'Number 1e10',Value:1e10},
                 {TypeStr:'String "1e10"',Value:'1e10'},
                 {TypeStr:'HEX Number 0x1234',Value:0x1234},
                 {TypeStr:'String "0x1234"',Value:'0x1234'},
                 {TypeStr:'Binary Number 0b101010',Value:0b101010},
                 {TypeStr:'String "0b101010"',Value:'0b101010'},
                 {TypeStr:'Empty String ""',Value:''},
                 {TypeStr:'String "\\t"',Value:"\t"},
                 {TypeStr:'String "\\n"',Value:"\n"},
                 {TypeStr:'String "xyz"',Value:'xyz'},
                 {TypeStr:'Boolean true',Value:true},
                 {TypeStr:'Boolean false',Value:false},
                 {TypeStr:'Array [0,1,2]',Value:[0,1,2]},
                 {TypeStr:'Hash {abc:1,xyz:2}',Value:{abc:1,xyz:2}}];
  for (var n = 0; n < TestNum.length; n++)
    console.log('[AUX] '+TestNum[n].TypeStr+':'+"\n"
                +'  GetVarType() = '+GetVarType(TestNum[n].Value)+"\n"
                +'  isNumeric()  = '+isNumeric(TestNum[n].Value)+"\n"
                +'  isNumber()   = '+isNumber(TestNum[n].Value)+"\n"
                +'  isString()   = '+isString(TestNum[n].Value)+"\n"
                +'  isArray()    = '+isArray(TestNum[n].Value)+"\n"
                +'  isBool()     = '+isBool(TestNum[n].Value));
}

//TestType();

function ConcatPaths(aPaths,sFilename)
{
  var sResPath = '';
  for (var n=0; n < aPaths.length; n++)
    sResPath = sResPath+aPaths[n]+'\\';
  var sResPathStart = '';
  // '\\' Am Anfang muss erhalten bleiben
  if (sResPath.substr(0,2) == '\\\\') {
    sResPathStart = '\\\\';
    sResPath = sResPath.substr(2);
  }
  sResPath = sResPathStart+(sResPath+sFilename).replace(/\\*\\/g,'\\');
  return sResPath;
}

function SetCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function GetCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function DeleteCookie(cname) {
  document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function Obj2Str(obj,level=0)
{
  var dumped_text = '';
  var level_padding = '';
  for(var j=0;j<level+1;j++) level_padding += '  ';
  if (level_padding.length > 20)
    return;

  if(typeof(obj) == 'object') {  
    for(var item in obj) {
      var value = obj[item];
      if(typeof(value) == 'object') {
        var sItemName = item;
        switch (GetVarType(obj)) {
          case 'array': sItemName = '['+item+']'; break;
        }
        dumped_text += level_padding + sItemName + " ... ("+GetVarType(obj)+" item)\n";
        dumped_text += this.Obj2Str(value,level+1);
      } else {
        if(typeof(value) != 'function')
          dumped_text += level_padding + "'" + item + "' => \"" + value + "\" ("+GetVarType(value)+")\n";
      }
    }
  } else { 
    dumped_text = "===>"+obj+"<===("+typeof(obj)+")";
  }
  return dumped_text;
}

function Text2HTML(sInStr,bNBSP)
{
  // Convert blanks to &nbsp; by default
  bNBSP = (bNBSP===undefined ? true : bNBSP);
  // Make sure sInStr is a string
  var sHTMLStr = ''+sInStr;
  // Convert HTML special characters
  sHTMLStr = sHTMLStr.replace(/&/g,"&amp;");
  sHTMLStr = sHTMLStr.replace(/"/g,"&quot;");
  sHTMLStr = sHTMLStr.replace(/</g,"&lt;");
  sHTMLStr = sHTMLStr.replace(/>/g,"&gt;");
  sHTMLStr = sHTMLStr.replace(/'/g,"&apos;");
  if (bNBSP)
    sHTMLStr = sHTMLStr.replace(/ /g,"&nbsp;");
  sHTMLStr = sHTMLStr.replace(/\\/g,'\\');
  sHTMLStr = sHTMLStr.replace(/\n/g,'<br>');
  return sHTMLStr;
}

function MD2HTML(MDText)
{
  return markdown.toHTML(MDText);
  
}

function HTMLUnit2Pixel(sHTMLUnitValue)
{
  var matches = sHTMLUnitValue.match(/(\d+)(.+)/);
  var value = parseFloat(matches[1]);
  var unit = matches[2];  
  var pxResValue = 0;
  switch (unit) {
    case 'px': pxResValue = value; break;
  }
  return pxResValue;
}

function Number2MBStr(Number,AddMB=true)
{
  var sSizeMB = '';
  if ((!isNaN(Number)) && (Number > 0))
    sSizeMB = ''+(Number/1024/1024).toFixed(1)+(AddMB ? 'MB' : '');
  else
    sSizeMB = '-';
  return sSizeMB;
}

function GetValueIfSet(Variable,Default)
{
  return (typeof(Variable) !== 'undefined' ? Variable : Default);
}

console.log('[AUX] lib/bw_libaux.js loaded ...');
