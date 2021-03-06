'use babel';
import AtomGoogleView from './atom-browser-view'
import { CompositeDisposable } from 'atom'

export default {
   subscriptions: null,

   deactivate() {
      this.html.destroy();
   },

   activate(state) {
      this.view = new AtomGoogleView(state.AtomGoogleViewState)
      this.setUpTheKeyBinds()
      this.listen()
   },
   /*------------------------------------------------------------------------*/
   /*--------------------------| Keyboard Binds |----------------------------*/
   /*------------------------------------------------------------------------*/
   setUpTheKeyBinds(){
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'atom-google:preview': () => this.preview(),
         'atom-google:reload': () => this.reload(),
         'atom-google:devtools': () => this.devtools(),
         'atom-google:showHide': () => this.showHide()
      }))
   },
   showHide(){
      if(atom.workspace.getBottomDock().state.visible){
         atom.workspace.getBottomDock().hide()
      } else {
         atom.workspace.getBottomDock().show()
         atom.workspace.open(this.view.workspace)
      }
   },
   /*------------------------------------------------------------------------*/
   /*--------------------------| Event Listeners |---------------------------*/
   /*------------------------------------------------------------------------*/
   listen: function(){
      this.view.html.webview.addEventListener('did-start-loading', () => {
         this.view.html.btn.reload.classList.add('loading')
      })

      this.view.html.webview.addEventListener('did-stop-loading', () => {
         this.view.html.btn.reload.classList.remove('loading')
      })

      //URL Bar
      this.view.html.addressbar.addEventListener('keyup', (e) => {
         if(e.key == 'Enter')
            this.setURL(this.view.html.addressbar.value)
      })

      //Button Events Back/Reload/Tools
      this.view.html.btn.reload.addEventListener('click', () => this.reload() )
      this.view.html.btn.back.addEventListener('click', () => this.back() )
      this.view.html.btn.devtools.addEventListener('click', () => this.devtools() )
      this.view.html.btn.livereload.addEventListener('click', () => {
         var active = !this.view.html.btn.livereload.classList.contains('active')
         this.view.html.btn.livereload.classList.toggle('active', active)
      })
      this.view.html.btn.tabs.addEventListener('click', () => this.tabs() )

      //Refresh on save
      atom.workspace.observeTextEditors((editor) => {
         editor.onDidSave(() => {
            if(this.view.html.btn.livereload.classList.contains('active'))
               this.reload()
         })
      })
   },
   /*------------------------------------------------------------------------*/
   /*--------------------------| Basic Functions |---------------------------*/
   /*------------------------------------------------------------------------*/
   preview(){
      //Get the selected path
      var selected = document.querySelector('.atom-dock-inner .selected .name')
      var path = selected.getAttribute('data-path')

      const fileURL = 'file:///'+path
      this.setURL(fileURL)
      atom.workspace.open(this.view.workspace)
   },
   reload(){
      if(this.view.html.webview.getWebContents())
         this.view.html.webview.reload()
   },
   back(){
      if(this.view.html.webview.canGoBack())
         this.view.html.webview.goBack()
   },
   devtools(){
      if(!this.view.html.webview.getWebContents()) return

      (this.view.html.webview.isDevToolsOpened())
         ? this.view.html.webview.closeDevTools()
         : this.view.html.webview.openDevTools()
   },
   tabs(){
      this.view.html.tabs.style.display =
         (this.view.html.tabs.style.display == '') ? 'none' : ''
   },
   /*------------------------------------------------------------------------*/
   /*-----------------------| Address Bar Functions |------------------------*/
   /*------------------------------------------------------------------------*/
   setURL: function(url){
      //Fix url
      //Search google
      if(url.indexOf('file://') < 0)
         if(url.indexOf(' ') >= 0 || url.indexOf(' ') < 0 && url.indexOf('.') < 0)
            url = 'https://www.google.com/#q='+url
      //Add http://
      if(url.indexOf('http://') < 0)
         if(url.indexOf('https://') < 0 && url.indexOf('file://') < 0)
            url = 'http://' + url


      this.view.html.addressbar.value = url;
      this.view.html.webview.src = ''
      this.view.html.webview.src = this.view.html.addressbar.value
   }
}
