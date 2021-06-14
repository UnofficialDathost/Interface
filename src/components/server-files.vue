<template>
  <div>
    <div v-if="treeLoaded">
      <div class="d-flex justify-content-between" style="margin-bottom:5px;">
        <div class="search-area">
            <b-icon class="float-left search-icon" icon="search"></b-icon>
            <input @input="inputDebounce($event.target.value)" class="custom-search-input" type="search" placeholder="Seach...">
        </div>
        <b-button v-if="fileContents !== ''" size="sm" v-b-modal.editor-fullscreen><b-icon icon="arrows-fullscreen"></b-icon> Fullscreen</b-button>
        <b-button v-else size="sm" disabled><b-icon icon="arrows-fullscreen"></b-icon> Fullscreen</b-button>
      </div>
      <div class="row">
        <div class="col-4" style="overflow-y:scroll;overflow-x:hidden;max-height:60vh;">
          <div v-if="displayTree && tree.children.length > 0">
            <vue-tree-list :model="tree" @click="nodeClicked" v-bind:default-expanded="false" default-tree-node-name="new folder" default-leaf-node-name="new file">
            </vue-tree-list>
          </div>
          <h5 v-else class="text-center" style="margin-top: 15px;">No result...</h5>
        </div>
        <div class="col-8">
          <div v-if="fileDownloading || fileContents === ''" class="editor d-flex justify-content-center mb-3">
            <b-spinner v-if="fileDownloading" style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
          </div>
          <div v-else>
            <b-modal :hide-footer="true" id="editor-fullscreen">
              <PrismEditor class="editor" style="max-height: 80vh;" v-model="fileContents" :highlight="() => highlighter" :line-numbers="true" />
            </b-modal>
            <PrismEditor class="editor" v-model="fileContents" :highlight="() => highlighter" :line-numbers="true" />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="d-flex justify-content-center mb-3">
      <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
    </div>
  </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import { Component, Prop } from 'vue-property-decorator'

import { VueTreeList, Tree, TreeNode } from 'vue-tree-list'

import { PrismEditor } from 'vue-prism-editor'
import { highlight, languages } from 'prismjs'

import clone from 'clone'
import { debounce } from 'debounce'

import 'vue-prism-editor/dist/prismeditor.min.css'
import 'prismjs/themes/prism-okaidia.css'

import Server from 'dathost/src/server'
import { IFile } from 'dathost/src/interfaces/file'

@Component({
  name: 'ServerFile',
  components: {
    VueTreeList,
    PrismEditor
  }
})
export default class ServerFileComp extends VueMixin {
  @Prop({ type: Object })
  serverObj: Server

  treeLoaded = false
  tree: ReturnType<typeof Tree>
  treeBackup: ReturnType<typeof Tree>

  inputDebounce: ReturnType<typeof debounce>

  // Needed to force reload tree when searching.
  displayTree = true

  highlighter = highlight('', languages.html, 'plain')
  fileContents = ''
  fileDownloading = false
  fileRegex = new RegExp(/^.*\.[^\\]+$/)

  async mounted (): Promise<void> {
    this.treeLoaded = false
    this.tree = new Tree([])

    for await (const file of this.serverObj.files()) {
      this.subTreeAdd(file[0])
    }

    this.sortByNodeThenAlhpa()

    // Clone tree object.
    this.treeBackup = clone(this.tree)

    this.inputDebounce = debounce(this.searchNodes, 500)

    this.treeLoaded = true
  }

  async nodeClicked (tree: ReturnType<typeof Tree>): Promise<void> {
    if (!tree.isLeaf) {
      tree.toggle()
    } else {
      this.fileDownloading = true

      const file = await this.serverObj.file(tree.id).download(true) as unknown as string

      const fileType = tree.id.split('.').pop()
      if (fileType === 'sp') {
        this.highlighter = highlight(file, languages.clike, 'clike')
      } else if (fileType === 'html') {
        this.highlighter = highlight(file, languages.html, 'html')
      } else if (fileType === 'json') {
        this.highlighter = highlight(file, languages.json, 'json')
      } else {
        this.highlighter = highlight(file, languages.markup, 'markup')
      }

      this.fileContents = file
      this.fileDownloading = false
    }
  }

  async searchNodes (search: string): Promise<void> {
    this.displayTree = false

    this.tree = clone(this.treeBackup)
    if (search !== '') {
      await this.childSearch(search.toLowerCase(), this.tree)
    }

    this.displayTree = true
  }

  async childSearch (search: string, tree: ReturnType<typeof Tree>): Promise<void> {
    if (tree.children == null) {
      return
    }

    for (const child of tree.children) {
      await this.childSearch(search, child)
    }

    tree.children = tree.children.filter((child: { name: string }) => {
      return child.name.toLowerCase().search(search) !== -1
    })
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
