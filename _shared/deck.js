/* הגדרות משותפות לכל המצגות. כל מצגת טוענת את הקובץ הזה בסוף ה-HTML. */
(function () {
  Reveal.initialize({
    rtl: true,
    hash: true,              // כל שקף מקבל כתובת משלו (#/3)
    slideNumber: "c/t",
    controls: true,
    progress: true,
    center: false,
    width: 1600,
    height: 900,
    margin: 0.04,
    transition: "fade",
    backgroundTransition: "fade",
    pdfSeparateFragments: false,
    plugins: [RevealNotes],  // S פותח חלון הערות דובר
  }).then(function () {
    DeckEmbeds.init(Reveal);
  });
})();
