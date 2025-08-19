// --- Templates -------------------------------------------------------------

class BW_Template_C {

  ID   = '';
  HTML = [];

  constructor(sTemplateID,aHTML=[])
  {
    //objDebug.WriteBEGIN(WD_NC,'GUI','Template:ctor',{sTemplateID:sTemplateID})
    this.ID = sTemplateID;
    if (aHTML.length == 0) {
      // Try to get the (HTML)-text from the HTML-page
      var eTemplate = document.getElementById(this.ID);
      if (eTemplate)
        aHTML = eTemplate.innerHTML.split("\n");
    }
    if (aHTML.length > 0) {
      // Scan for sections
      var sSection = '';
      for (var h = 0; h < aHTML.length; h++) {
        var sNewSection = '';
        // New section?
        if (aHTML[h].indexOf('<template id=') > 0) {
          //objDebug.Write(0,'aHTML['+h+']="'+aHTML[h]+'"');
          //console.log('Template('+h+'): aHTML['+h+']="'+aHTML[h]+'"');
          var mr = aHTML[h].match(/id="(?<tplname>[^"]+)"/);
          sNewSection = mr.groups.tplname;
          //objDebug.Write(0,'mr.groups.tplname="'+mr.groups.tplname+'"');
          //console.log('Template('+h+'): mr.groups.tplname="'+mr.groups.tplname+'"');
          // Extract text between <template id...> and </template> on the same line
          var sTplText = aHTML[h].replace(/[ ]*/,'');
          sTplText = sTplText.replace(/<template[^\>]+>/,'');
          sTplText = sTplText.replace(/<\/template>.*/,'');
          //console.log('Template('+h+'): sTplText="'+sTplText+'"');
          if (sTplText != '') {
            //console.log('Template('+h+'): Section='+sNewSection+', Text='+sTplText);
            this.HTML.push({Section:sNewSection, Text:sTplText});
          }
        }
        if ((sNewSection == '') && (sSection != '')) {
          //console.log('Template('+h+'): Section='+sSection+', Text='+aHTML[h]);
          this.HTML.push({Section:sSection, Text:aHTML[h]});
        }
        sSection = (sNewSection!='' ? sNewSection : sSection);
      }
      console.log('[GUI] Template "'+this.ID+'" loaded ('+this.HTML.length+' lines)');
    }
    else
    {
      alert('[GUI] Template "'+this.ID+'" does not exist!');
    }
    //objDebug.WriteEND();
  }

  Render(sSection,aVariables)
  {
    sSection = (!sSection ? 'Body' : sSection);
    aVariables = (!aVariables ? [{xyz:'xyz'}] : aVariables);
    //console.log('[GUI] Template "'+this.ID+'" Render('+sSection+','
    //  +aVariables.length+')');
    aVariables = Param2NameValueArray(aVariables);
    //console.log('[GUI] Template "'+this.ID+'" aVariables.length='+aVariables.length);
    // Generate the HTML text
    var sHTML = ''
    if (this.ID != '')
    {
      // Extract (HTML)-text of the requested section
      var sArrayName = '';
      for (var h = 0; h < this.HTML.length; h++)
        if (this.HTML[h].Section == sSection)
          sHTML += this.HTML[h].Text;
      // Replace all variables
      for (var v = 0; v < aVariables.length; v++)
        sHTML = sHTML.replaceAll('%%'+aVariables[v].Name+'%%',aVariables[v].Value);
      //console.log('[GUI] sHTML.length='+sHTML.length);
      }
    else
    {
      console.log('[GUI] No template assigned !!!');
    }
    return sHTML;
  }
}

class BW_Templates_C {

  TplList = [];
  AllTemplatesLoaded = false;
  OnLoadFinished = 0;
  
  constructor (OnLoadFinishedCB=0) {
    this.OnLoadFinished = OnLoadFinishedCB;
  }
  
  LoadFromFile(sTemplatesFN)
  {
    //objDebug.WriteBEGIN(WD_ON,'GUI','BW_Templates_C:LoadFromFile',{sTemplatesFN:sTemplatesFN})
    console.log('[GUI] BW_Templates_C:LoadFromFile('+sTemplatesFN+')');
    // Load the file from the server
    const myRequest = new Request(sTemplatesFN);
    fetch(myRequest)
      .then((response) => response.text())
      .then((text) => {
        // Split the text into lines
        var aFileTplText = text.split("\n");
        var sTemplateID = '';
        var aTplText = [];
        for (var tt = 0; tt < aFileTplText.length; tt++) {
          var sTlpLine = aFileTplText[tt];
          var sTmpLine = sTlpLine.replace(/^[ ]*/,'');
          // Ignore all comments (# ...) and empty lines
          if ((sTmpLine != '') && (sTmpLine.substring(0,1) != '#')) {
            // Begin of a template
            if (sTlpLine.indexOf('<template id=') == 0) {
              var mr = sTlpLine.match(/<template id="(?<tplname>[^"]+)">/);
              sTemplateID = mr.groups.tplname;
              aTplText = [];
            } else {
              // End of a template; add it to the template-list
              if (sTlpLine.indexOf('</template>') == 0) {
                this.TplList.push(new BW_Template_C(sTemplateID,aTplText));
                sTemplateID = '';
              } else {
                // Everything else is a (HTML-)line in the template
                if (sTemplateID != '')
                  aTplText.push(sTlpLine);
              }
            }
          }
        }
        this.AllTemplatesLoaded = true;
        this.OnLoadFinished();
      });
    console.log('[GUI] END BW_Templates_C:LoadFromFile');
    //objDebug.WriteEND();
  }
  
  Add(sID)
  {
    var bAddOK = false;
    var eTemplate = document.getElementById(sID);
    if (eTemplate) {
      this.TplList.push(new BW_Template_C(sID));
      bAddOK = true;
    } else {
      alert('Template "'+sID+'" not found!!!');
    }
    return bAddOK;
  }

  Get(sID)
  {
    var Template = 'Template "'+sID+'" not found!';
    for (var t = 0; t < this.TplList.length; t++)
      Template = (this.TplList[t].ID == sID ? this.TplList[t] : Template);
    return Template;
  }
  
  Render(sID,sSection,aVariables)
  {
    console.log('BW_Templates_C.Render("'+sID+'","'+sSection+'",'+aVariables+')');
    return this.Get(sID).Render(sSection,aVariables);
  }
}

// --- Get the width of a scrollbar ------------------------------------------
// From https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript

function GetScrollbarWidth()
{
  // Creating invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement('div');
  outer.appendChild(inner);
  
  // Calculating difference between container's full width and the child width
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer);

  return scrollbarWidth;
}

console.log('[GUI] lib/bw_libgui.js loaded ...');
