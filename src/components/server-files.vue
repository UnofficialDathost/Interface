<template>
  <div>
    <div class="d-flex justify-content-between" style="margin-bottom:5px;">
      <div class="search-area">
          <b-icon class="float-left search-icon" icon="search"></b-icon>
          <input v-if="treeLoaded" @input="inputDebounce($event.target.value)" class="custom-search-input" type="search" placeholder="Seach...">
          <input v-else disabled class="custom-search-input" type="search" placeholder="Seach...">
      </div>
      <div v-if="!fileDownloading">
        <b-button v-if="fileContents !== ''" size="sm" @click="downloadFile(fileContents, fileDownloadingName)"><b-icon icon="download"></b-icon> Download</b-button>
        <b-button v-else size="sm" disabled><b-icon icon="download"></b-icon> Download</b-button>

        <b-button size="sm" v-b-modal.editor-fullscreen style="margin-left: 5px;"><b-icon icon="arrows-fullscreen"></b-icon> Fullscreen</b-button>
      </div>
    </div>
    <div class="row">
      <div class="col-4" style="overflow-y:scroll;overflow-x:hidden;max-height:60vh;">
        <div v-if="treeLoaded">
          <vue-tree-list v-if="tree.children != null && tree.children.length > 0" :key="treeKey" :model="tree" @click="nodeClicked" @add-node="addNode" @delete-node="deleteNode" @drop="moveNode" v-bind:default-expanded="false">
            <template v-slot:leafNameDisplay="node">
              <span v-if="!node.model.isLeaf">{{ node.model.name.replace('/', '') }}</span>
              <span v-else v-b-tooltip.hover :title="node.model.size >= 1000000 ? `${(node.model.size * 0.000001).toFixed(2)} MB` : `${(node.model.size * 0.0009765625).toFixed(2)} KB`">
                {{ node.model.name }}
              </span>
            </template>
            <template v-slot:treeNodeIcon="node">
              <span v-if="!node.expanded" class="node-icon">
                <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="folder fill" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi-folder-fill mx-auto b-icon bi" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"><g data-v-41be6633=""><path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z"></path></g></svg>
              </span>
              <span v-else class="node-icon">
                <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="folder2 open" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi-folder2-open mx-auto b-icon bi" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"><g data-v-41be6633=""><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"></path></g></svg>
              </span>
            </template>
            <template v-slot:leafNodeIcon="node">
              <span v-if="node.model.size <= 100000 && downloadOnly.indexOf(node.model.name.split('.').pop()) === -1" class="node-icon">
                <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="file earmark code fill" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi-file-earmark-code-fill mx-auto b-icon bi" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"><g data-v-41be6633=""><path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM6.646 7.646a.5.5 0 1 1 .708.708L5.707 10l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2zm2.708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 10 8.646 8.354a.5.5 0 1 1 .708-.708z"></path></g></svg>
              </span>
              <span v-else class="node-icon">
                <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="file arrow down fill" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi-file-arrow-down-fill mx-auto b-icon bi" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"><g data-v-41be6633=""><path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM8 5a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5A.5.5 0 0 1 8 5z"></path></g></svg>
              </span>
            </template>
          </vue-tree-list>
          <h5 v-else class="text-center" style="margin-top: 15px;">No result...</h5>
        </div>
        <div v-else class="d-flex justify-content-center mb-3">
          <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
        </div>
      </div>
      <div class="col-8">
        <div v-if="fileDownloading" class="d-flex justify-content-center mb-3 CodeMirror" style="background-color:var(--dathost-dark-dark);">
          <b-spinner v-if="fileDownloading" style="width: 6rem; height: 6rem; margin-top: 25px;color:#adafae;" label="Loading..."></b-spinner>
        </div>
        <div v-else>
          <b-modal :hide-footer="true" id="editor-fullscreen">
            <codemirror :options="editorOptions" v-model="fileContents" />
            <div class="d-flex justify-content-end mb-3">
            <template v-if="!fileUploading">
              <b-button v-if="!ogContents" @click="saveFileChanges()" variant="primary"><b-icon icon="stickies"></b-icon> Save</b-button>
              <b-button v-else disabled variant="primary"><b-icon icon="stickies"></b-icon> Save</b-button>
            </template>
            <b-button v-else disabled variant="primary"><b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner> Saving</b-button>
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
            <template v-if="!fileUploading">
              <b-button v-if="!ogContents" @click="saveFileChanges()" style="width: 20%;" variant="primary" size="sm"><b-icon icon="stickies"></b-icon> Save</b-button>
              <b-button v-else disabled style="width: 20%;" variant="primary" size="sm"><b-icon icon="stickies"></b-icon> Save</b-button>
            </template>
            <b-button v-else disabled style="width: 20%;" variant="primary" size="sm"><b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner> Saving</b-button>
          </div>
        </div>
      </div>
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
        <h5>Downloading...</h5>
        <div class="row" style="margin:0px">
          <div class="col-10">
            <b-progress height="20px" :max="100" variant="warning" :value="downloadProgress"></b-progress>
          </div>
          <div class="col">{{ downloadProgress }}%</div>
        </div>
      </div>
    </b-modal>
    <b-modal id="upload-select" hide-footer hide-header centered size="lg">
      <div v-if="!uploadType">
        <b-card-group deck>
          <b-card @click="uploadType = 'file'" class="text-center upload-type" style="cursor: pointer;background-color: var(--dathost-dark-dark);">
            <div class="mb-2" style="font-size: 4em;">
              <b-icon icon="file-earmark-plus"></b-icon>
            </div>
            <h5 style="margin-bottom:0px;">Create new file</h5>
          </b-card>
          <b-card @click="uploadType = 'files'" class="text-center upload-type" style="cursor: pointer;background-color: var(--dathost-dark-dark);">
            <div class="mb-2" style="font-size: 4em;">
              <b-icon icon="cloud-upload"></b-icon>
            </div>
            <h5 style="margin-bottom:0px;">Upload file(s)</h5>
          </b-card>
        </b-card-group>
      </div>
      <div v-else>
        <div v-if="uploadType === 'file'">
          <b-form-input placeholder="File name (e.g. server.cfg)" v-model="newFileName"></b-form-input>
          <codemirror :options="editorOptions" v-model="newFileContents" />
          <div class="d-flex justify-content-end">
            <template v-if="!newFileUploading">
              <b-button v-if="newFileName !== ''" @click="uploadNodeFile()" style="width:40%;" variant="primary" size="sm"><b-icon icon="stickies"></b-icon> Upload</b-button>
              <b-button v-else disabled style="width:40%;" variant="primary" size="sm"><b-icon icon="stickies"></b-icon> Upload</b-button>
            </template>
            <b-button v-else disabled style="width: 40%;" variant="primary" size="sm"><b-spinner label="Spinning" style="width: 1.4em; height: 1.4em;"></b-spinner> Uploading</b-button>
          </div>
        </div>
        <div v-else>
          <div v-if="!newFileUploading">
            <file-pond :instant-upload="false" :server="{}" :onupdatefiles="zipUploadedContents" :onremovefile="removeFromZip" :allow-multiple="true" max-total-file-size="500MB"></file-pond>
            <b-button block @click="uploadAndUnzip()" variant="primary" size="sm"><b-icon icon="cloud-upload"></b-icon> Upload file(s)</b-button>
          </div>
          <div v-else class="text-center">
            <div class="d-flex justify-content-center mb-3">
              <b-spinner style="width: 5rem; height: 5rem;" label="Loading..."></b-spinner>
            </div>
            <transition name="slide-fade">
              <h4>{{ fileUploadingMsg }}</h4>
            </transition>
          </div>
        </div>
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

import vueFilePond from 'vue-filepond'
import { FilePondFile } from 'filepond'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import FilePondPluginFileEncode from 'filepond-plugin-file-encode'
import 'filepond/dist/filepond.min.css'

import JSZip from 'jszip'

import Server from 'dathost/src/server'
import { IServer } from 'dathost/src/interfaces/server'
import { IFile } from 'dathost/src/interfaces/file'

const FilePond = vueFilePond(FilePondPluginFileValidateSize, FilePondPluginFileEncode)

@Component({
  name: 'ServerFile',
  components: {
    VueTreeList,
    codemirror,
    FilePond
  }
})
export default class ServerFileComp extends VueMixin {
  @Prop({ type: Object })
  server: IServer

  @Prop({ type: Object })
  serverObj: Server

  treeLoaded = false
  tree: ReturnType<typeof Tree>
  treeKey = 0
  treeBackup: ReturnType<typeof Tree>
  dirs: { path: string, size: number }[] = []

  ftpPassword = ''
  ftpPasswordLoading = false

  inputDebounce: ReturnType<typeof debounce>

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
  downloadProgress = 0
  fileUploading = false
  fileDownloading = false
  fileDownloadPath = ''
  fileDownloadingName = ''
  fileRegex = new RegExp(/^.*\.[^\\]+$/)
  // File ext that should only be downloaded
  // no matter the size.
  downloadOnly = [
    'smx',
    'dem',
    'so',
    'dll',
    'exe',
    'sh',
    'vdf',
    'mp3',
    'mp4',
    'wav',
    'png',
    'jpg',
    'gif',
    'jpeg',
    'bin',
    'zip'
  ]

  uploadType = ''
  newFileContents = ''
  newFileName = ''
  newFileUploading = false
  newFileParent: ReturnType<typeof Tree>

  zipContents: JSZip
  fileUploadingMsg = ''

  async mounted (): Promise<void> {
    this.ftpPassword = this.server.ftp_password

    this.inputDebounce = debounce(this.searchNodes, 500)

    const editorTheme = localStorage.getItem('editorTheme')
    if (editorTheme) {
      this.setTheme(editorTheme)
    } else {
      this.setTheme('lesser-dark')
    }

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
    let i = 0
    let j = 0
    let result = ''

    while (j < this.fileContents.length) {
      if (this.ogFileContent[i] !== this.fileContents[j] || i === this.ogFileContent.length) {
        result += this.fileContents[j]
      } else {
        i++
      }
      j++
    }

    this.ogContents = result.trim() === ''
  }

  async saveFileChanges (): Promise<void> {
    this.fileUploading = true
    this.$bvToast.toast(`Saving ${this.fileDownloadingName}`, {
      noCloseButton: true,
      title: '',
      toaster: 'b-toaster-bottom-right'
    })

    await this.serverObj.file(this.fileDownloadPath).upload(new Blob([this.fileContents], { type: 'text/plain' }))
    this.fileUploading = false
    this.ogFileContent = this.fileContents
    this.ogContents = true

    this.$bvToast.toast(`${this.fileDownloadingName} saved`, {
      noCloseButton: true,
      title: '',
      headerClass: 'toast-header-competed',
      toaster: 'b-toaster-bottom-right'
    })
  }

  async nodeClicked (tree: ReturnType<typeof Tree>): Promise<void> {
    if (!tree.isLeaf) {
      tree.toggle()
    } else {
      if (!this.ogContents) {
        this.$bvModal.msgBoxConfirm(`Are you sure you want to lose changes made to ${tree.name}?`, {
          title: 'Changes are about to be lost!',
          okTitle: 'Lose my changes',
          okVariant: 'secondary',
          cancelVariant: 'primary',
          headerClass: 'p-2 border-bottom-0',
          footerClass: 'p-2 border-top-0',
          centered: true
        }).then(async value => {
          if (value) {
            await this.downloadNode(tree)
          }
        })
      } else {
        await this.downloadNode(tree)
      }
    }
  }

  addNode (tree: ReturnType<typeof Tree>): void {
    this.zipContents = new JSZip()
    this.newFileParent = tree.parent
    this.uploadType = ''
    this.newFileContents = ''
    this.newFileName = ''
    this.newFileUploading = false

    // Remove dummy file this lib creates.
    tree.remove()
    this.$bvModal.show('upload-select')
  }

  zipUploadedContents (files: FilePondFile[]): void {
    // Needs to be notated correctly!
    for (const file of files) {
      if (!this.zipContents.file(file.filename)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const data = file.getFileEncodeBase64String()
        if (data) {
          this.zipContents.file(file.filename, data, { base64: true })
        }
      }
    }
  }

  // eslint-disable-next-line handle-callback-err
  removeFromZip (error: unknown, file: FilePondFile): void {
    // Needs to be notated correctly!
    const zipFile = this.zipContents.file(file.filename)
    if (zipFile && zipFile.name) {
      this.zipContents.remove(zipFile.name)
    }
  }

  async uploadAndUnzip (): Promise<void> {
    this.newFileUploading = true
    this.fileUploadingMsg = 'Getting compressed data...'

    this.zipContents.generateAsync({ type: 'blob' }).then(async data => {
      const zipFile = this.serverObj.file(`temp-${this.newFileParent.id}${Math.random().toString(36).slice(-8)}.zip`)

      this.$bvToast.toast('Uploading compressed files', {
        noCloseButton: true,
        title: '',
        toaster: 'b-toaster-bottom-right'
      })
      this.fileUploadingMsg = 'Uploading compressed files...'
      await zipFile.upload(data)

      this.$bvToast.toast('Unzipping compressed files', {
        noCloseButton: true,
        title: '',
        toaster: 'b-toaster-bottom-right'
      })
      this.fileUploadingMsg = 'Unzipping compressed files...'
      await zipFile.unzip(this.newFileParent.id)

      this.zipContents.forEach((relativePath, file) => {
        this.newFileParent.addChildren(new TreeNode({
          name: file.name,
          id: `${this.newFileParent.id}${file.name}`,
          size: data.size,
          isLeaf: true,
          addLeafNodeDisabled: true,
          addTreeNodeDisabled: true,
          editNodeDisabled: true
        }))
      })

      this.treeKey += 1

      this.fileUploadingMsg = 'Files uploaded...'
      this.$bvToast.toast('Files uploaded!', {
        noCloseButton: true,
        title: '',
        headerClass: 'toast-header-competed',
        toaster: 'b-toaster-bottom-right'
      })

      this.$bvModal.hide('upload-select')

      // Delete temp zip file
      await zipFile.delete()
    })
  }

  async uploadNodeFile (): Promise<void> {
    this.newFileUploading = true

    const serverFilePath = `${this.newFileParent.id}${this.newFileName}`
    const fileBlob = new Blob([this.newFileContents])
    const fileName = this.newFileName.replace(/^.*[\\/]/, '')

    this.$bvToast.toast(`Uploading ${fileName}`, {
      noCloseButton: true,
      title: '',
      toaster: 'b-toaster-bottom-right'
    })

    await this.serverObj.file(
      serverFilePath
    ).upload(fileBlob)

    this.newFileParent.addChildren(new TreeNode({
      name: fileName,
      id: serverFilePath,
      size: fileBlob.size,
      isLeaf: true,
      addLeafNodeDisabled: true,
      addTreeNodeDisabled: true,
      editNodeDisabled: true
    }))

    this.treeKey += 1

    this.$bvModal.hide('upload-select')

    this.$bvToast.toast(`${fileName} uploaded!`, {
      noCloseButton: true,
      title: '',
      headerClass: 'toast-header-competed',
      toaster: 'b-toaster-bottom-right'
    })
  }

  async deleteNode (tree: ReturnType<typeof Tree>): Promise<void> {
    const nodeType = tree.isLeaf ? 'file' : 'folder & all its contents'
    this.$bvModal.msgBoxConfirm(`Are you sure you want to delete ${tree.name}?`, {
      title: `You are about to delete a ${nodeType}!`,
      okTitle: `Delete this ${nodeType}`,
      okVariant: 'secondary',
      cancelVariant: 'primary',
      headerClass: 'p-2 border-bottom-0',
      footerClass: 'p-2 border-top-0',
      centered: true
    }).then(async value => {
      if (value) {
        this.$bvToast.toast(`Deleting ${tree.name}`, {
          noCloseButton: true,
          title: '',
          toaster: 'b-toaster-bottom-right'
        })

        tree.remove()
        this.treeKey += 1

        await this.serverObj.file(tree.id).delete()

        this.$bvToast.toast(`${tree.name} deleted!`, {
          noCloseButton: true,
          title: '',
          headerClass: 'toast-header-competed',
          toaster: 'b-toaster-bottom-right'
        })
      }
    })
  }

  async moveNode (params: { node: ReturnType<typeof TreeNode>, src: ReturnType<typeof TreeNode>, target: ReturnType<typeof TreeNode> }): Promise<void> {
    console.log(params)
  }

  async downloadNode (tree: ReturnType<typeof TreeNode>): Promise<void> {
    const file = this.serverObj.file(tree.id)
    const fileType = tree.name.split('.').pop()

    this.fileDownloadingName = tree.name
    this.fileDownloadPath = tree.id
    this.fileContents = ''
    this.ogFileContent = ''

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
          this.downloadProgress = 0

          this.$bvModal.show('downloading')
          this.$bvToast.toast(`Downloading ${tree.name}`, {
            noCloseButton: true,
            title: '',
            toaster: 'b-toaster-bottom-right'
          })

          const buffer = await file.download(false, { onDownloadProgress: (progress) => this.updateDownloadProgress(progress, tree.size) }) as Blob
          this.downloadFile(buffer, tree.name, buffer.type)

          this.$bvModal.hide('downloading')
        }
      })
    }
  }

  updateDownloadProgress (progress: { loaded: number }, totalLength: number): void {
    if (progress.loaded !== 0) {
      this.downloadProgress = Math.floor(
        progress.loaded / totalLength * 100
      )
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
    this.treeLoaded = false

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
              addTreeNodeDisabled: true,
              editNodeDisabled: true
            }))
          }
        }
      }
    } else {
      this.tree = clone(this.treeBackup)
    }

    this.treeLoaded = true
  }

  subTreeAdd (file: IFile, tree = this.tree, dir?: string): void {
    let pathToFormat: string
    if (typeof dir !== 'undefined') {
      pathToFormat = dir
    } else {
      pathToFormat = file.path
    }

    const dirs = pathToFormat.split(/(?<=\/)/).filter(n => n)
    const isFile = this.fileRegex.test(pathToFormat)

    if (dirs.length === 0 || dirs.length === 1) {
      tree.addChildren(new TreeNode({
        name: pathToFormat,
        id: file.path,
        isLeaf: isFile,
        size: file.size ? file.size : 0,
        addLeafNodeDisabled: isFile,
        addTreeNodeDisabled: true,
        editNodeDisabled: true
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
