var RBG_ViewOptions = {
      ScrollBarWidth:    0,
      Templates:         null
    };

var RBTestDoc = null;
var RBRender  = null;

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
  var sElementID = eElement.id;
  switch (sElementID) {
    case 'RBG.Nav.Edit':
      // Render template with canvas
      var eRBGMainDefault = document.getElementById('Frame.Main');
      eRBGMainDefault.innerHTML = RBG_ViewOptions.Templates.Render('RBG.Page.Template','Body',[]);
      // Resize Canvas
      var ePageCanvas = document.getElementById('RBG.Page.Canvas');
      ePageCanvas.width = ePageCanvas.clientWidth;
      ePageCanvas.height = ePageCanvas.clientHeight;
      // Create document for testing
      RBTestDoc = RBG_CreateTestDoc();
      // Render page 1
      RBRender = new RBG_Render_C();
      RBRender.SetSheet(RBTestDoc.Sheet);
      RBRender.SelectTarget(RBG_RTScreen);
      RBRender.SetRulersON(false);
      RBRender.SetScale(1.0);
      RBRender.SetCanvas('RBG.Page.Canvas',false);
      RBTestDoc.Render(RBRender,1);
      break;
    case 'RBG.Nav.RulersOnOff':
      var bRullersON = RBRender.GetRulersON();
      RBRender.SetRulersON(!bRullersON);
      eElement.textContent = 'Lineal: '+(!bRullersON ? 'AUS' : 'EIN');
      RBRender.SetCanvas('RBG.Page.Canvas',false);
      RBTestDoc.Render(RBRender,1);
      break;
    case 'RBG.Nav.ScrollbarsOnOff':
      var bScrollbarsON = RBRender.GetScrollbarsON();
      RBRender.SetScrollbarsON(!bScrollbarsON);
      eElement.textContent = 'Scrollbars: '+(!bScrollbarsON ? 'AUS' : 'EIN');
      RBRender.SetCanvas('RBG.Page.Canvas',false);
      RBTestDoc.Render(RBRender,1);
      break;
    default:
      alert('[RBG_OnClick] Unknown element ID "'+eElement.id+'" !!!');
      break;
  }
}

function RBG_CreateTestDoc()
{
  // Create document
  var TestSheet = new RBG_Sheet_C(null,'A4');
  TestSheet.PrintMargin.Set(null,3.0,3.0,3.0,3.0,'mm');
  var TestDoc = new RBG_Document_C('RB71','ArGe Posthorn - Heuss Rundbrief 71');
  TestDoc.SetSheet(TestSheet);
  var TestSection = TestDoc.Sections.GetByID('CoverFront');
  var TestPage1 = TestSection.GetPage(0);
  var nSheetWidth = TestSheet.GetWidth('mm');
  var nSheetHeight = TestSheet.GetHeight('mm');
  // Generelles Design der Titelseite
  var CoverBg = TestPage1.Content.Add(RBG_ETRect,'Background',0,0,nSheetWidth,nSheetHeight,'mm');
  CoverBg.SetFill('#44736C');
  var CoverWnd = TestPage1.Content.Add(RBG_ETRect,'Window', 10,100,nSheetWidth,243-100,'mm');
  CoverWnd.SetFill('white');
  var CoverWndLn = TestPage1.Content.Add(RBG_ETRect,'WindowLine',11,101,nSheetWidth+1,243-100-2,'mm');
  CoverWndLn.SetStroke('#66B7AB',0.1,'mm');
  var CoverMiNr130 = TestPage1.Content.Add(RBG_ETImage,'MiNr. 130',10,10,70,83.5,'mm');
  CoverMiNr130.SetFilename('./img/MiNr130.SW.001.jpg');
  CoverMiNr130.Filters.SetOpacity(10);
  CoverMiNr130.SetBlendMode('lighter');
  var CoverMiNr186 = TestPage1.Content.Add(RBG_ETImage,'MiNr. 186',nSheetWidth-67-10,10,70,83.5,'mm');
  CoverMiNr186.SetFilename('./img/MiNr186.SW.001.jpg');
  CoverMiNr186.Filters.SetOpacity(10);
  CoverMiNr186.SetBlendMode('lighter');
  var CoverTitle1 = TestPage1.Content.Add(RBG_ETText,'TitleArGe',nSheetWidth/2,18,0,0,'mm');
  CoverTitle1.SetText('Arbeitsgemeinschaft');
  CoverTitle1.SetColor('white');
  CoverTitle1.SetFont('serif', 6.35,'mm', 'normal', '', 'normal');
  CoverTitle1.SetAlign('center');
  CoverTitle1.SetShadow(2,'black',3,3);
  var CoverTitle2 = TestPage1.Content.Add(RBG_ETText,'TitleArGePH1',nSheetWidth/2,35.6,0,0,'mm');
  CoverTitle2.SetText('BUND DAUERSERIEN');
  CoverTitle2.SetColor('white');
  CoverTitle2.SetFont('serif', 36,'px', 'normal', 'bold', 'normal');
  CoverTitle2.SetAlign('center');
  CoverTitle2.SetShadow(2,'black',3,3);
  var CoverTitle3 = TestPage1.Content.Add(RBG_ETText,'TitleArGePH1',nSheetWidth/2,45.7,0,0,'mm');
  CoverTitle3.SetText('POSTHORN und HEUSS e.V.');
  CoverTitle3.SetColor('white');
  CoverTitle3.SetFont('serif', 36,'px', 'normal', 'bold', 'normal');
  CoverTitle3.SetAlign('center');
  CoverTitle3.SetShadow(2,'black',3,3);
  var CoverTitle4 = TestPage1.Content.Add(RBG_ETText,'TitleBdPh',nSheetWidth/2,60,0,0,'mm');
  CoverTitle4.SetText('im Bund Deutscher Philatelisten e.V.');
  CoverTitle4.SetColor('white');
  CoverTitle4.SetFont('serif', 24,'px', 'normal', '', 'normal');
  CoverTitle4.SetAlign('center');
  CoverTitle4.SetShadow(2,'black',3,3);
  var CoverRBNr = TestPage1.Content.Add(RBG_ETText,'RBNr',210,249.4,0,0,'mm');
  CoverRBNr.SetText('71');
  CoverRBNr.SetColor('#668C87');
  CoverRBNr.SetFont('serif', 250,'px', 'normal', 'bold', 'normal');
  CoverRBNr.SetAlign('right');
  CoverRBNr.SetBaseline('hanging');
  var CoverRB = TestPage1.Content.Add(RBG_ETText,'RB',nSheetWidth/2,270,0,0,'mm');
  CoverRB.SetText('Rundbrief 71 - April 2025');
  CoverRB.SetColor('white');
  CoverRB.SetFont('serif', 36,'px', 'normal', 'bold', 'normal');
  CoverRB.SetAlign('center');
  CoverRB.SetShadow(2,'black',3,3);
  var CoverDatum = TestPage1.Content.Add(RBG_ETText,'RB',-(100+243)/2,nSheetWidth-17-3,0,0,'mm');
  CoverDatum.SetText('04/2025');
  CoverDatum.SetColor('#E0E0E0');
  CoverDatum.SetFont('serif', 100,'px', 'normal', 'bold', 'normal');
  CoverDatum.SetAlign('center');
  CoverDatum.SetRotation(-90,'deg');
  // Titelthema
  var CoverImgSt2000 = TestPage1.Content.Add(RBG_ETImage,'Stempel2000',22+13,140+18,0,0,'mm');
  CoverImgSt2000.SetFilename('./img/ArGePH.Stempel.2000.jpg');
  var CoverImgSt2025 = TestPage1.Content.Add(RBG_ETImage,'Stempel2000',100+13,139+18,0,0,'mm');
  CoverImgSt2025.SetFilename('./img/ArGePH.Stempel.2025.jpg');
  var Cover25Jahre = TestPage1.Content.Add(RBG_ETText,'RB',nSheetWidth/2,100+18,0,0,'mm');
  Cover25Jahre.SetText('25 Jahre');
  Cover25Jahre.SetColor('#215E99');
  Cover25Jahre.SetFont('serif', 75, 'px', 'italic', 'bold', 'normal');
  Cover25Jahre.SetAlign('center');
  Cover25Jahre.SetShadow(2,'silver',3,3);
  return TestDoc;
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
