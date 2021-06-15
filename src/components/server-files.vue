<template>
  <div>
    <div v-if="treeLoaded">
      <div class="d-flex justify-content-between" style="margin-bottom:5px;">
        <div class="search-area">
            <b-icon class="float-left search-icon" icon="search"></b-icon>
            <input @input="inputDebounce($event.target.value)" class="custom-search-input" type="search" placeholder="Seach...">
        </div>
        <div v-if="fileContents !== ''">
          <b-button size="sm" @click="downloadFile(fileContents, fileDownloadingName)"><b-icon icon="download"></b-icon> Download</b-button>
          <b-button size="sm" v-b-modal.editor-fullscreen style="margin-left: 5px;"><b-icon icon="arrows-fullscreen"></b-icon> Fullscreen</b-button>
        </div>
      </div>
      <div class="row">
        <div class="col-4" style="overflow-y:scroll;overflow-x:hidden;max-height:60vh;">
          <div v-if="displayTree && tree.children != null && tree.children.length > 0">
            <vue-tree-list :model="tree" @click="nodeClicked" v-bind:default-expanded="false" default-tree-node-name="new folder" default-leaf-node-name="new file">
            </vue-tree-list>
          </div>
          <h5 v-else class="text-center" style="margin-top: 15px;">No result...</h5>
        </div>
        <div class="col-8">
          <div v-if="fileDownloading || fileContents === ''" class="d-flex justify-content-center mb-3 CodeMirror" style="background-color:var(--dathost-dark-dark);">
            <b-spinner v-if="fileDownloading" style="width: 6rem; height: 6rem; margin-top: 25px;color:#adafae;" label="Loading..."></b-spinner>
          </div>
          <div v-else>
            <b-modal :hide-footer="true" id="editor-fullscreen">
              <codemirror :options="editorOptions" v-model="fileContents" />
              <div class="d-flex justify-content-end mb-3">
                <b-button v-if="!ogContents" variant="primary"><b-icon icon="stickies"></b-icon> Save</b-button>
                <b-button v-else disabled variant="primary"><b-icon icon="stickies"></b-icon> Save</b-button>
              </div>
            </b-modal>
            <codemirror :options="editorOptions" v-model="fileContents" />

            <div class="d-flex justify-content-between" style="margin-top:5px;">
              <b-dropdown size="sm">
                <template #button-content>
                  Theme: <strong class="text-capitalize">{{ editorOptions.theme.replaceAll('-', ' ') }}</strong>
                </template>
                <template v-for="theme in themes">
                  <b-dropdown-item v-if="theme !== editorOptions.theme" @click="setTheme(theme)" :key="theme" class="text-capitalize">{{ theme.replaceAll('-', ' ') }}</b-dropdown-item>
                </template>
              </b-dropdown>
              <b-button v-if="!ogContents" style="width: 20%;" variant="primary" size="sm"><b-icon icon="stickies"></b-icon> Save</b-button>
              <b-button v-else disabled style="width: 20%;" variant="primary" size="sm"><b-icon icon="stickies"></b-icon> Save</b-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="d-flex justify-content-center mb-3">
      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
    </div>

    <div>
      <h5 style="margin-top:10px;margin-bottom:5px;">FTP Details</h5>
      <p @click="copyToClipboard(server.ip)" v-b-tooltip.hover.left title="Copy to clipboard" style="margin:0;cursor: pointer;">
        Host: <strong v-if="server.ip">{{ server.ip }}</strong><span v-else>Start server to get IP.</span>
      </p>
      <p @click="copyToClipboard('21')" v-b-tooltip.hover.left title="Copy to clipboard" style="margin:0;cursor: pointer;">Port: <strong>21</strong></p>
      <p @click="copyToClipboard(server.id)" v-b-tooltip.hover.left title="Copy to clipboard" style="margin:0;cursor: pointer;">Username: <strong>{{ server.id }}</strong></p>
      <p @click="copyToClipboard(ftpPassword)" v-b-tooltip.hover.left title="Copy to clipboard" style="margin-bottom:5px;cursor: pointer;">Password: <strong>{{ ftpPassword }}</strong></p>
      <b-button v-if="!ftpPasswordLoading" @click="regenerateFtp()" variant="primary" size="sm">Regenerate Password</b-button>
      <b-button v-else disabled variant="primary" size="sm">
        <b-spinner label="Spinning" style="width: 1.3em; height: 1.3em;"></b-spinner> Regenerating Password
      </b-button>
    </div>
    <b-modal id="downloading" title-class="downloading-title" :title="fileDownloadingName" hide-footer centered size="lg">
      <div class="text-center">
        <b-spinner label="Spinning" style="width: 4em; height: 4em;margin-bottom:10px;"></b-spinner>
        <h5>Downloading...</h5>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

import { VueTreeList, Tree, TreeNode } from 'vue-tree-list'

import clone from 'clone'
import { debounce } from 'debounce'
import download from 'downloadjs'

import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/clike/clike'

import Server from 'dathost/src/server'
import { IServer } from 'dathost/src/interfaces/server'
import { IFile } from 'dathost/src/interfaces/file'

@Component({
  name: 'ServerFile',
  components: {
    VueTreeList,
    codemirror
  }
})
export default class ServerFileComp extends VueMixin {
  @Prop({ type: Object })
  server: IServer

  @Prop({ type: Object })
  serverObj: Server

  treeLoaded = false
  tree: ReturnType<typeof Tree>
  treeBackup: ReturnType<typeof Tree>
  dirs: { path: string, size: number }[] = []

  ftpPassword = ''
  ftpPasswordLoading = false

  inputDebounce: ReturnType<typeof debounce>

  // Needed to force reload tree when searching.
  displayTree = true

  editorOptions = {
    lineNumbers: true,
    line: true,
    collapseIdentical: false,
    theme: '',
    mode: ''
  }

  themes = [
    'lesser-dark',
    'erlang-dark',
    '3024-night',
    'ambiance',
    'ayu-dark',
    'dracula',
    'material-darker',
    'material-ocean',
    'neat',
    'neo',
    'night',
    'solarized',
    'the-matrix',
    'tomorrow-night-bright',
    'xq-dark',
    'xq-light'
  ]

  fileContents = ''
  ogFileContent = ''
  ogContents = true
  fileDownloading = false
  fileDownloadingName = ''
  fileRegex = new RegExp(/^.*\.[^\\]+$/)
  // File ext that should only be downloaded
  // no matter the size.
  downloadOnly = [
    'smx',
    'dem',
    'so',
    'dll'
  ]

  async mounted (): Promise<void> {
    this.ftpPassword = this.server.ftp_password

    this.treeLoaded = false
    this.tree = new Tree([])

    for await (const file of this.serverObj.files({ fileSizes: true })) {
      this.dirs.push({
        path: file[0].path,
        size: file[0].size ? parseInt(file[0].size) : 0
      })
      this.subTreeAdd(file[0])
    }

    this.sortByNodeThenAlhpa()

    // Clone tree object.
    this.treeBackup = clone(this.tree)

    this.inputDebounce = debounce(this.searchNodes, 500)

    const editorTheme = localStorage.getItem('editorTheme')
    if (editorTheme) {
      this.setTheme(editorTheme)
    } else {
      this.setTheme('lesser-dark')
    }

    this.treeLoaded = true
  }

  async regenerateFtp (): Promise<void> {
    this.ftpPasswordLoading = true
    await this.serverObj.regenerateFtpPassword()
    this.ftpPassword = (await this.serverObj.get()).ftp_password
    this.ftpPasswordLoading = false
  }

  setTheme (theme: string): void {
    // eslint-disable-next-line no-unused-expressions
    import(`@/assets/css/themes/${theme}.css`)

    this.editorOptions.theme = theme
    localStorage.setItem('editorTheme', theme)
  }

  @Watch('fileContents')
  watchContents (): void {
    this.ogContents = this.fileContents === this.ogFileContent
  }

  async nodeClicked (tree: ReturnType<typeof Tree>): Promise<void> {
    if (!tree.isLeaf) {
      tree.toggle()
    } else {
      const file = this.serverObj.file(tree.id)
      const fileType = tree.name.split('.').pop()
      this.fileDownloadingName = tree.name

      if (tree.size <= 100000 && this.downloadOnly.indexOf(fileType) === -1) {
        this.fileDownloading = true

        this.fileContents = await file.download(true) as string
        this.ogFileContent = this.fileContents

        if (fileType === 'sp') {
          this.editorOptions.mode = 'clike'
        } else {
          this.editorOptions.mode = ''
        }

        this.fileDownloading = false
      } else {
        this.$bvModal.msgBoxConfirm(`Are you sure you want download ${tree.name}`, {
          title: 'Download',
          okTitle: 'Download',
          headerClass: 'p-2 border-bottom-0',
          footerClass: 'p-2 border-top-0',
          centered: true
        }).then(async value => {
          if (value) {
            this.$bvModal.show('downloading')
            this.$bvToast.toast(`Downloading ${tree.name}`, {
              noCloseButton: true,
              title: '',
              toaster: 'b-toaster-bottom-right'
            })

            const buffer = await file.download() as Blob
            this.downloadFile(buffer, tree.name, buffer.type)

            this.$bvModal.hide('downloading')
          }
        })
      }
    }
  }

  downloadFile (data: string | Blob, name: string, type = 'text/plain'): void {
    download(data, name, type)

    this.$bvToast.toast(`${name} Downloaded`, {
      noCloseButton: true,
      title: '',
      headerClass: 'toast-header-competed',
      toaster: 'b-toaster-bottom-right'
    })
  }

  async searchNodes (search: string): Promise<void> {
    this.displayTree = false

    if (search !== '') {
      const searchLower = search.toLowerCase()

      this.tree = new Tree([])
      for (const dir of this.dirs) {
        if (dir.path.toLowerCase().search(searchLower) !== -1) {
          const isFile = this.fileRegex.test(dir.path)
          if (isFile) {
            this.tree.addChildren(new TreeNode({
              name: dir.path.replace(/^.*[\\/]/, ''),
              id: dir.path,
              size: dir.size,
              isLeaf: true,
              addLeafNodeDisabled: true,
              addTreeNodeDisabled: true
            }))
          }
        }
      }
    } else {
      this.tree = clone(this.treeBackup)
    }

    this.displayTree = true
  }

  subTreeAdd (file: IFile, tree = this.tree, dir?: string): void {
    let pathToFormat: string
    if (typeof dir !== 'undefined') {
      pathToFormat = dir
    } else {
      pathToFormat = file.path
    }

    const dirs = pathToFormat.split(/(?<=\/)/).filter(n => n)

    if (dirs.length === 0 || dirs.length === 1) {
      const isFile = this.fileRegex.test(pathToFormat)
      tree.addChildren(new TreeNode({
        name: pathToFormat,
        id: file.path,
        isLeaf: isFile,
        size: file.size ? file.size : 0,
        addLeafNodeDisabled: isFile,
        addTreeNodeDisabled: isFile
      }))
    } else {
      for (const treeChild of tree.children) {
        if (!this.fileRegex.test(treeChild.name) && dirs.indexOf(treeChild.name) !== -1) {
          this.subTreeAdd(file, treeChild, pathToFormat.replace(treeChild.name, ''))
          break
        }
      }
    }
  }

  sortByNodeThenAlhpa (tree = this.tree): void {
    if (tree.children != null) {
      tree.children.sort((a: { id: string, isLeaf: boolean }, b: { id: string, isLeaf: boolean }) => {
        if (a.isLeaf && b.isLeaf) {
          return a.id < b.id ? -1 : 1
        } else {
          if (!a.isLeaf && !b.isLeaf) {
            return a.id < b.id ? -1 : 1
          } else if (!a.isLeaf) {
            return -1
          } else {
            return 1
          }
        }
      })

      for (const child of tree.children) {
        this.sortByNodeThenAlhpa(child)
      }
    }
  }
}
</script>
