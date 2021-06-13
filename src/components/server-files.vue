<template>
  <div v-if="treeLoaded" style="height: 60vh; overflow-y: scroll;">
    <vue-tree-list :model="tree" v-bind:default-expanded="false" default-tree-node-name="new folder" default-leaf-node-name="new file">
      <template v-slot:treeNodeIcon="slotProps">
        <b-icon class="treeIcon" :icon="!slotProps.expanded ? 'folder-fill' : 'folder2-open'"></b-icon>
      </template>
      <template v-slot:leafNodeIcon>
        <b-icon class="treeIcon" icon="file-earmark-code"></b-icon>
      </template>
    </vue-tree-list>
  </div>
  <div v-else class="d-flex justify-content-center mb-3">
    <b-spinner style="width: 6rem; height: 6rem; margin-top: 25px;" label="Loading..."></b-spinner>
  </div>
</template>

<script lang="ts">
import VueMixin from '@/mixins/vue'
import { Component, Prop } from 'vue-property-decorator'

import { VueTreeList, Tree, TreeNode } from 'vue-tree-list'

import Server from 'dathost/src/server'
import { IFile } from 'dathost/src/interfaces/file'

@Component({
  name: 'ServerFile',
  components: {
    VueTreeList
  }
})
export default class ServerFileComp extends VueMixin {
  @Prop({ type: Object })
  serverObj: Server

  treeLoaded = false
  tree: ReturnType<typeof Tree>

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

  subTreeAdd (file: IFile, tree = this.tree): void {
    const dirs = file.path.split(/(?<=\/)/).filter(n => n)

    if (dirs.length === 0 || dirs.length === 1) {
      const isFile = this.fileRegex.test(file.path)
      tree.addChildren(new TreeNode({
        name: file.path,
        id: file.path,
        isLeaf: isFile,
        editNodeDisabled: !isFile,
        addLeafNodeDisabled: isFile,
        addTreeNodeDisabled: isFile
      }))
    } else {
      for (const treeChild of tree.children) {
        if (!this.fileRegex.test(treeChild.id) && dirs.indexOf(treeChild.id) !== -1) {
          file.path = file.path.replace(treeChild.id, '')
          this.subTreeAdd(file, treeChild)
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
