// Message types Debug::Write()
MT_None       = 0;
MT_Debug      = 1;
MT_Error      = 2;
MT_Warning    = 3;
MT_Info       = 4;
MT_ParseError = 5;
MT_unknown    = 6;
var aDebugMTStr = ['MT_None____',
                   'MT_Debug___',
                   'MT_Error___',
                   'MT_Warning_',
                   'MT_Info____',
                   'MT_ParseErr',
                   'MT_unknown_'];

WD_ON         = 0;
WD_OFF        = 1;
WD_NC         = 2;  // No change (take over ON/OFF state from parent level)
WD_FORCE      = 3;  // Force debug output (not used?)

class Debug
{
  MaxIndent   = 100;
  Indent      = 0;
  IndentChar  = ' ';
  Buffer      = [];
  ONStack     = [];
  WrFctPNames = false;
  
  constructor()
  {

  }

  Write
    (nIndent,      // Relative ident value
     sDebugText,   // Any text...
     nMessageType) // See constants MT_xxx
  {
    if (this.IsWriteON()) {
      nMessageType = (nMessageType===undefined ? MT_Debug : nMessageType);
      if (nIndent < 0) this.CalcIndent(nIndent);
      var sModule = (this.ONStack.length > 0 ? this.ONStack[this.ONStack.length-1].Module : '???');
      this.Buffer.push({Module:sModule,Indent:this.Indent,Type:'TEXT',Text:sDebugText});
      if (nIndent > 0) this.CalcIndent(nIndent);
    }
  }

  WriteBEGIN(cDebugOn,sModule,sFunction,aFctParam)
  {
    this.ONStack.push({DebugON:cDebugOn,Module:sModule,Function:sFunction});
    var sDegubONStr = '';
    for (var os = 0; os < this.ONStack.length; os++)
      switch (this.ONStack[os].DebugON) {
        case WD_ON:  sDegubONStr += 'Y'; break;
        case WD_OFF: sDegubONStr += 'N'; break;
        case WD_NC:  sDegubONStr += '='; break;
      }
    //console.log('[DBG] '+sFunction+' ['+sDegubONStr+']');
    if (this.IsWriteON()) {
      var aFctParamNV = Param2NameValueArray(aFctParam);
      this.Buffer.push({Module:sModule,Indent:this.Indent,Type:'BLKB',Function:sFunction,
                        FctParam:aFctParamNV});
      this.CalcIndent(2);
    }
  }

  WriteEND(sResult='')
  {
    if (this.IsWriteON()) {
      this.CalcIndent(-2);
      var aLastONStack = this.ONStack[this.ONStack.length-1];
      this.Buffer.push({Module:aLastONStack.Module, Indent:this.Indent, Type:'BLKE',
                        Function:aLastONStack.Function, Result:sResult});
    }
    if (this.ONStack.length > 0)
      this.ONStack.pop();
  }

  WriteDBCommand(sCmdStr)
  {
    this.Buffer.push({Module:'DB ', Indent:this.Indent, Type:'DBSC', DBCmd:sCmdStr});
  }

  WriteDBResponse(sStatusCode,sResponseStr)
  {
    this.Buffer.push({Module:'DB ', Indent:this.Indent, Type:'DBRT',
                      StatusCode:sStatusCode, DBResponse:sResponseStr});
  }

  Obj2Str(obj,level=0)
  {
    var dumped_text = '';
    var level_padding = '';
    for(var j=0;j<level+1;j++) level_padding += '  ';
  
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

  WriteVar(sName,obj)
  {
    var sModule = (this.ONStack.length > 0 ? this.ONStack[this.ONStack.length-1].Module : '???');
    this.Buffer.push({Module:sModule,Indent:this.Indent,Type:'OBJ',
                      VarName:sName+' ('+GetVarType(obj)+')',VarValues:[]});
    var aDumpedText = this.Obj2Str(obj).split("\n");
    for (var dt = 0; dt < aDumpedText.length; dt++)
      this.Buffer[this.Buffer.length-1].VarValues.push(aDumpedText[dt]);
  }

  Clear()
  {
    this.Buffer = [];
    this.Indent = 0;
  }

  CalcIndent(nIndent)
  {
    if (nIndent < 0)
      this.Indent = (this.Indent+nIndent >= 0 ? this.Indent+nIndent : 0);
    else
      this.Indent = (this.Indent+nIndent <= this.MaxIndent ? this.Indent+nIndent : this.MaxIndent);
  }

  IsWriteON()
  {
    var cDebugONState = WD_OFF;
    for (var os = 0; os < this.ONStack.length; os++)
      if (this.ONStack[os].DebugON != WD_NC)
        cDebugONState = this.ONStack[os].DebugON;
    return (cDebugONState == WD_ON);
  }

}


var objDebug = new Debug();
objDebug.WriteBEGIN(WD_ON,'GUI','Test',{});
objDebug.Write(0,'Test (0)');
objDebug.Write(2,'Test (+2)');
objDebug.Write(0,'Test (0)');
objDebug.Write(-2,'Test (-2)');
objDebug.Write(0,'Test (0)');
objDebug.WriteEND();

function RenderDebug(sElementIDHead,sElementIDDetail)
{
  // Render head of debug page
  var TDebugHead = new Template('TDebug');
  var eDebugHead = document.getElementById(sElementIDHead);
  eDebugHead.innerHTML = TDebugHead.Render('Body',{});

  // Render debug messages
  var eDebug = document.getElementById(sElementIDDetail);
  var nSHIndex = 0;
  var sDebugHTML = '';
  for (var bi = 0; bi < objDebug.Buffer.length; bi++) {
    var sLinePrefix = '['+objDebug.Buffer[bi].Module+'] ';
    for (var i = 0; i < objDebug.Buffer[bi].Indent; i++)
      sLinePrefix += objDebug.IndentChar;
    switch (objDebug.Buffer[bi].Type) {
      case 'TEXT':
        var sText = sLinePrefix+objDebug.Buffer[bi].Text;
        sDebugHTML += TDebugHead.Render('Line',{Text:Text2HTML(sText)});
        break;
      case 'OBJ':
        if (objDebug.Buffer[bi].VarValues.length > 1) {
          sDebugHTML += TDebugHead.Render('BlockBegin',
                        {Text:Text2HTML(sLinePrefix+objDebug.Buffer[bi].VarName),
                         SHIndex:nSHIndex});
          for (var vv = 0; vv < objDebug.Buffer[bi].VarValues.length; vv++)
            sDebugHTML += TDebugHead.Render('Line',
                          {Text:Text2HTML(sLinePrefix+objDebug.Buffer[bi].VarValues[vv])});
          sDebugHTML += TDebugHead.Render('BlockEnd',{});
          nSHIndex++;
        } else {
          sDebugHTML += TDebugHead.Render('Line',
                        {Text:Text2HTML(sLinePrefix+objDebug.Buffer[bi].VarName+': '
                         +objDebug.Buffer[bi].VarValues[0])});
        }
      break;
      case 'BLKB':
        if (objDebug.Buffer[bi].Function != '') {
          var sFctHead = 'BEGIN '+objDebug.Buffer[bi].Function+'(';
          aFctParam = objDebug.Buffer[bi].FctParam;
          for (var p = 0; p < aFctParam.length; p++)
            sFctHead += (p > 0 ? ',' : '')+
                        (objDebug.WrFctPNames ? aFctParam[p].Name+': ' : '')+
                        (isString(aFctParam[p].Value) ? '"' : '')+
                        aFctParam[p].Value+
                        (isString(aFctParam[p].Value) ? '"' : '');
          sFctHead += ')';
          sDebugHTML += TDebugHead.Render('Line',{Text:Text2HTML(sLinePrefix+sFctHead)});
        }
        break;
      case 'BLKE':
        if (objDebug.Buffer[bi].Function != '') {
          var sResult = objDebug.Buffer[bi].Result;
          var sFctEnd = 'END '+objDebug.Buffer[bi].Function+'()'+
                        (sResult != '' ? ': '+sResult : '');
          sDebugHTML += TDebugHead.Render('Line',{Text:Text2HTML(sLinePrefix+sFctEnd)});
        }
        break;
      case 'DBSC':
        var aDBCmdParam = objDebug.Buffer[bi].DBCmd.split('&');
        var sCmd = '???';
        for (var cp = 0; cp < aDBCmdParam.length; cp++)
          if (aDBCmdParam[cp].split('=')[0] == 'Cmd')
            sCmd = aDBCmdParam[cp].split('=')[1];
        var sDBCmd = 'Send command "'+sCmd+'" to DB:';
        sDebugHTML += TDebugHead.Render('BlockBegin',{Text:Text2HTML(sLinePrefix+sDBCmd), SHIndex:nSHIndex});
        nSHIndex++;
        for (var cp = 0; cp < aDBCmdParam.length; cp++)
          sDebugHTML += TDebugHead.Render('Line',{Text:Text2HTML(sLinePrefix+'|- '+aDBCmdParam[cp])});
        sDebugHTML += TDebugHead.Render('BlockEnd',{});
        break;
      case 'DBRT':
        aDBResponse = objDebug.Buffer[bi].DBResponse.split("\n");
        var sResponseHead = 'Response from DB: '+aDBResponse.length+' lines, '+
                            'Status='+objDebug.Buffer[bi].StatusCode
        sDebugHTML += TDebugHead.Render('BlockBegin',{Text:Text2HTML(sLinePrefix+sResponseHead), SHIndex:nSHIndex});
        nSHIndex++;
        for (var rt = 1; rt < aDBResponse.length; rt++)
          sDebugHTML += TDebugHead.Render('Line',{Text:Text2HTML(sLinePrefix+'|- '+aDBResponse[rt])});
        sDebugHTML += TDebugHead.Render('BlockEnd',{});
        break;
    }
  }
  eDebug.innerHTML = sDebugHTML;
}
