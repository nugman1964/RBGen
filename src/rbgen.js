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
      // Render template with canvas
      var eRBGMainDefault = document.getElementById('RBG.Main.Default');
      eRBGMainDefault.innerHTML = RBG_ViewOptions.Templates.Render('RBG.Page.Template','Body',[]);

      // Create document
      var TestRenderOptions = new RBG_RenderOptions_C();
      var TestDoc = new RBG_Document_C('RB71','ArGe Posthorn - Heuss Rundbrief 71');
      var TestSection = TestDoc.GetSection('CoverFront');
      var TestPage = TestSection.GetPage('1');
      var TestPage1Elem = TestSection.GetElementsForPage('1');
      var nSheetWidth = TestPage.GetSheetWidth('mm');
      var nSheetHeight = TestPage.GetSheetHeight('mm');
      var CoverBg = TestPage1Elem.Add(new RBG_ElementRect_C('Background',0,0,nSheetWidth,nSheetHeight,'mm'));
      CoverBg.SetFill('#44736C');
      var CoverWnd = TestPage1Elem.Add(new RBG_ElementRect_C('Window', 6,100,nSheetWidth,243-100,'mm'));
      CoverWnd.SetFill('white');
      var CoverWndLn = TestPage1Elem.Add(new RBG_ElementRect_C('WindowLine',7,101,nSheetWidth+1,243-100-2,'mm'));
      CoverWndLn.SetStroke('#66B7AB',0.1,'mm');
      var CoverTitle1 = TestPage1Elem.Add(new RBG_ElementText_C('TitleArGe',nSheetWidth/2,18,0,0,'mm'));
      CoverTitle1.SetText('Arbeitsgemeinschaft');
      CoverTitle1.SetColor('white');
      CoverTitle1.SetFont('serif', 24, 'px', 'normal', '', 'normal');
      CoverTitle1.SetAlign('center');
      var CoverTitle2 = TestPage1Elem.Add(new RBG_ElementText_C('TitleArGePH1',nSheetWidth/2,35.6,0,0,'mm'));
      CoverTitle2.SetText('BUND DAUERSERIEN');
      CoverTitle2.SetColor('white');
      CoverTitle2.SetFont('serif', 36, 'px', 'normal', 'bold', 'normal');
      CoverTitle2.SetAlign('center');
      var CoverTitle3 = TestPage1Elem.Add(new RBG_ElementText_C('TitleArGePH1',nSheetWidth/2,45.7,0,0,'mm'));
      CoverTitle3.SetText('POSTHORN und HEUSS e.V.');
      CoverTitle3.SetColor('white');
      CoverTitle3.SetFont('serif', 36, 'px', 'normal', 'bold', 'normal');
      CoverTitle3.SetAlign('center');
      var CoverTitle4 = TestPage1Elem.Add(new RBG_ElementText_C('TitleBdPh',nSheetWidth/2,60,0,0,'mm'));
      CoverTitle4.SetText('im Bund Deutsche Philatelisten e.V.');
      CoverTitle4.SetColor('white');
      CoverTitle4.SetFont('serif', 24, 'px', 'normal', '', 'normal');
      CoverTitle4.SetAlign('center');
      var CoverRBNr = TestPage1Elem.Add(new RBG_ElementText_C('RBNr',210,249.4,0,0,'mm'));
      CoverRBNr.SetText('71');
      CoverRBNr.SetColor('#668C87');
      CoverRBNr.SetFont('serif', 250, 'px', 'normal', 'bold', 'normal');
      CoverRBNr.SetAlign('right');
      CoverRBNr.SetBaseline('hanging');
      var CoverRB = TestPage1Elem.Add(new RBG_ElementText_C('RB',nSheetWidth/2,270,0,0,'mm'));
      CoverRB.SetText('Rundbrief 71 - April 2025');
      CoverRB.SetColor('white');
      CoverRB.SetFont('serif', 36, 'px', 'normal', 'bold', 'normal');
      CoverRB.SetAlign('center');
      // Prepare canvas
      var nCanvasWidth  = TestPage.GetSheetWidth('px',TestRenderOptions.DPI);
      var nRulerWidthPX = TestRenderOptions.Ruler.Width.toUnit('px',TestRenderOptions.DPI);
      nCanvasWidth += (TestRenderOptions.Ruler.ShowLeft ? nRulerWidthPX : 0);
      nCanvasWidth += (TestRenderOptions.Ruler.ShowRight ? nRulerWidthPX : 0);
      var nCanvasHeight = TestPage.GetSheetHeight('px',TestRenderOptions.DPI);
      nCanvasHeight += (TestRenderOptions.Ruler.ShowTop ? nRulerWidthPX : 0);
      nCanvasHeight += (TestRenderOptions.Ruler.ShowBottom ? nRulerWidthPX : 0);
      var ePageDiv = document.getElementById('RBG.Page.Div');
      ePageDiv.style.width = nCanvasWidth+'px';
      ePageDiv.style.height = nCanvasHeight+'px';
      var ePageCanvas = document.getElementById('RBG.Page.Canvas');
      ePageCanvas.width = nCanvasWidth;
      ePageCanvas.height = nCanvasHeight;
      // Render page
      TestPage.Render('RBG.Page.Canvas',TestRenderOptions);

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
