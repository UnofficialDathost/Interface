<template>
  <div v-if="treeLoaded">
    <vue-tree-list :model="tree" v-bind:default-expanded="false">
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

    this.treeLoaded = true
  }

  subTreeAdd (file: IFile, tree = this.tree): void {
    const dirs = file.path.split(/(?<=\/)/).filter(n => n)

    if (dirs.length === 0 || dirs.length === 1) {
      tree.addChildren(new TreeNode({
        name: file.path,
        id: file.path
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
}
</script>
