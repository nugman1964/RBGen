var RBG_ViewOptions = {
      ScrollBarWidth:    0,
      Templates:         null
    };

function RBG_Init()
{
  console.log('[RBG_Init]');
  RBG_ViewOptions.ScrollBarWidth = GetScrollbarWidth()
  RBG_ViewOptions.Templates = new BW_Templates_C();
  RBG_ViewOptions.Templates.OnLoadFinished = RBG_OnTemplatesLoaded;
  RBG_ViewOptions.Templates.LoadFromFile('./templates/rbg_templates.html');
  window.onresize = RBG_OnWindowRezise;
}

// --- Template functions ------------------------------------------------------------------------

function RBG_AddTemplate(sTemplateName)
{
  var bAddOK = RBG_ViewOptions.Templates.Add(sTemplateName);
  if (!bAddOK)
    alert('Template "'+sTemplateName+'" not found!!!');
  return bAddOK;
}

function RBG_RenderTemplate(sTemplateName,sSection,aVariables)
{
  return RBG_ViewOptions.Templates.Render(sTemplateName,sSection,aVariables);
}

function RBG_OnTemplatesLoaded()
{
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

function RBG_OnClick(eElement)
{
  console.log('[RBG_OnClick] eElement.id='+eElement.id);
  var sElementID     = eElement.id;
  switch (sElementID) {
    case 'RBG.Nav.Edit':
      var eRBGMainDefault = document.getElementById('RBG.Main.Default');
      eRBGMainDefault.innerHTML = RBG_ViewOptions.Templates.Render('RBG.Page.Template','Body',[]);
      var TestDoc = new RBG_Document_C('RB71','ArGe Posthorn - Heuss Rundbrief 71');
      var TestSection = TestDoc.GetSection('CoverFront');
      var TestPage = TestSection.GetPage('1');
      var TestPage1Elem = TestSection.GetElementsForPage('1');
      var CoverBgTop = TestPage1Elem.Add(new RBG_ElementRect_C('BgTop', 0, 0, 250.0, 100.0, 'mm'));
      CoverBgTop.SetFill('green');
      var CoverBgTop2 = TestPage1Elem.Add(new RBG_ElementRect_C('BgTop', 10, 10, 20, 10, 'mm'));
      CoverBgTop2.SetFill('red');
      TestPage.Render('RBG.Page.Canvas');
      break;
    default:
      alert('[RBG_OnClick] Unknown element ID "'+eElement.id+'" !!!');
      break;
  }
}

function RBG_OnImageUploadResponse(Command,ResponseStatus,ResponseStatusText,SampleID,ImageNr)
{
  console.log('[RBG_OnImageUploadResponse] Command = '+Command+'; SampleID = '+SampleID+'; ImageNr = '+ImageNr);
  if ((Command == 'WI') && (ImageNr == 1)) {
    BGF_BtV_SampleEditEnd();
    BGFWaitForImagesAvail(SampleID);
    //BGF_BtV_SampleUpdateFullImage(BGFGetSampleByID(SampleID));
    //setTimeout('BGF_BtV_SampleUpdateFullImage(BGFGetSampleByID("'+SampleID+'"));',500);
  }
}

// --- Callback for click events -----------------------------------------------------------------

function RBG_OnWindowRezise()
{
  console.log('[RBG_OnWindowRezise] window.innerHeight = '+window.innerHeight+'; window.innerWidth = '+window.innerWidth);
}
