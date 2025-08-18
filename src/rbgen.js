var BGF_BtV_ViewOptions = {
      MaxSampleImgWidth: '200',
      ScrollBarWidth:    GetScrollbarWidth(),
      SamplesList:       'IL', // IL=ImageList, CL=CompactList
      Templates:         new BW_Templates_C(),
      ActBRSFilter:      '',
      ActSrcFilter:      '',
      ActSrcNFPFilter:   false // NFP = no final price
    };

// --- Template functions ------------------------------------------------------------------------

function RBG_AddTemplate(sTemplateName)
{
  var bAddOK = BGF_BtV_ViewOptions.Templates.Add(sTemplateName);
  if (!bAddOK)
    alert('Template "'+sTemplateName+'" not found!!!');
  return bAddOK;
}

function RBG_RenderTemplate(sTemplateName,sSection,aVariables)
{
  return BGF_BtV_ViewOptions.Templates.Render(sTemplateName,sSection,aVariables);
}

// --- Several GUI functions ---------------------------------------------------------------------

// --- Callback from GUI on changed values -------------------------------------------------------

function RBG_OnChange(eElement)
{
  
  console.log('[RBG_OnChange] eElement.id='+eElement.id);
  var sElementID     = eElement.id;
  switch (sElementID) {
    case 'RBG.Nav.Edit':
      break;
    default:
      alert('[RBG_OnChange] Unknown element ID "'+eElement.id+'" !!!');
      break;
  }
}

// --- Callback for click events -----------------------------------------------------------------

function BGF_BtV_OnClick(eElement)
{
  console.log('[BGF_BtV_OnClick] eElement.id='+eElement.id);
  var sElementID     = eElement.id;
  switch (sElementID) {
    case 'RBG.Nav.Edit':
      var TestDoc = new RBG_Document_C('RB71','ArGe Posthorn - Heuss Rundbrief 71');
      var TestSection = TestDoc.GetSection('CoverFront');
      var TestPage = TestSection.GetPage('1');
      var TestPage1Elem = TestSection.GetElementsForPage('1');
      var CoverBgTop = TestPage1Elem.Add(new RBG_ElementRect_C('BgTop', 0, 0, 250.0, 100.0, 'mm'));
      CoverBgTop.SetFill('green');
      break;
    default:
      alert('[BGF_BtV_OnClick] Unknown element ID "'+eElement.id+'" !!!');
      break;
  }
}

function BGF_BtV_OnImageUploadResponse(Command,ResponseStatus,ResponseStatusText,SampleID,ImageNr)
{
  console.log('[BGF_BtV_OnImageUploadResponse] Command = '+Command+'; SampleID = '+SampleID+'; ImageNr = '+ImageNr);
  if ((Command == 'WI') && (ImageNr == 1)) {
    BGF_BtV_SampleEditEnd();
    BGFWaitForImagesAvail(SampleID);
    //BGF_BtV_SampleUpdateFullImage(BGFGetSampleByID(SampleID));
    //setTimeout('BGF_BtV_SampleUpdateFullImage(BGFGetSampleByID("'+SampleID+'"));',500);
  }
}

// --- Callback for click events -----------------------------------------------------------------

function BGF_BtV_OnWindowRezise()
{
  console.log('[BGF_BtV_OnWindowRezise] window.innerHeight = '+window.innerHeight+'; window.innerWidth = '+window.innerWidth);
  if (BGF_BtV_FullImage.Visible) {
    BGF_BtV_SampleSwitchFullImage(0);
    BGF_BtV_SampleSwitchFullImage(BGF_BtV_FullImage.ImageNr);
  }
}
