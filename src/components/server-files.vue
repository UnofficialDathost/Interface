<template>
  <div>
    <div v-if="treeLoaded">
      <div class="row">
        <div class="col-4" style="overflow-y:scroll;overflow-x:hidden;max-height:60vh;">
          <vue-tree-list :model="tree" @click="nodeClicked" v-bind:default-expanded="false" default-tree-node-name="new folder" default-leaf-node-name="new file">
            <template v-slot:treeNodeIcon="slotProps">
              <b-icon class="treeIcon" :icon="!slotProps.expanded ? 'folder-fill' : 'folder2-open'"></b-icon>
            </template>
            <template v-slot:leafNodeIcon>
              <b-icon class="treeIcon" icon="file-earmark-code"></b-icon>
            </template>
            <template v-slot:editNodeIcon>
              <b-icon class="treeIcon" icon="pencil-square"></b-icon>
            </template>
            <template v-slot:delNodeIcon>
              <b-icon class="treeIcon" icon="trash"></b-icon>
            </template>
            <template v-slot:addLeafNodeIcon>
              <b-icon class="treeIcon" icon="file-earmark-plus"></b-icon>
            </template>
            <template v-slot:addTreeNodeIcon>
              <b-icon class="treeIcon" icon="folder-plus"></b-icon>
            </template>
          </vue-tree-list>
        </div>
        <div class="col-8">
          <div v-if="fileDownloading || fileContents === ''" class="editor d-flex justify-content-center mb-3">
            <b-spinner v-if="fileDownloading" style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
          </div>
          <PrismEditor v-else class="editor" v-model="fileContents" :highlight="() => highlighter" :line-numbers="true" />
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
      } else {
        this.highlighter = highlight(file, languages.markup, 'markup')
      }

      this.fileContents = file
      this.fileDownloading = false
    }
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
