<template>
  <div class="s-upload">
    <div @click="onClickUpload">
      <slot></slot>
    </div>
    <ol class="s-upload-file-list">
      <li v-for="file in fileList" :key="file.name">
        <div class="s-upload-image-wrapper">
          <template v-if="file.status === 'uploading'">
            <s-icon name="line-loading"></s-icon>
          </template>
          <template v-else-if="file.type.indexOf('image') === 0">
            <img :src="file.url" class="s-upload-image" alt="" width="32" height="32">
          </template>
          <template v-else>
            <div class="s-upload-default-image"></div>
          </template>
        </div>
        <span
          class="s-upload-file-name"
          :class="{
            'success': file.status === 'success',
            'uploading': file.status === 'uploading',
            'fail': file.status === 'fail'
          }"
        >
          {{file.name}}
        </span>
        <s-button @click="onRemoveFile(file)" type="error">删除</s-button>
      </li>
    </ol>
    <div ref="temp" style="width: 0; height: 0; overflow: hidden;"></div>
  </div>
</template>

<script>
  import Button from '../button/button'
  import Icon from '../icon'
  export default {
    name: "s-upload",
    components: {
      's-button': Button,
      's-icon': Icon
    },
    props: {
      name: {
        type: String,
        required: true
      },
      action: {
        type: String,
        required: true
      },
      method: {
        type: String,
        default: 'POST'
      },
      parseResponse: {
        type: Function,
        require: true
      },
      fileList: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        url: 'about:blank'
      }
    },
    methods: {
      onRemoveFile(file) {
        let answer = window.confirm(`你确认要删除${file.name}吗`)
        if (answer) {
          let copy = [...this.fileList]
          let index = copy.indexOf(file)
          copy.splice(index, 1)
          this.$emit('update:fileList', copy)
        }
      },
      onClickUpload() {
        let input = this.createInput()
        input.addEventListener('change', ()=>{
          let file = input.files[0]
          this.uploadFile(file)
          input.remove()
        })
        input.click()
      },
      beforeUploadFile(rawFile) {
        let {name, size, type} = rawFile
        this.$emit('update:fileList', [...this.fileList, {name, type, size, status: 'uploading'}])
      },
      afterUploadFile(name, url) {
        let file = this.fileList.filter(i => i.name === name)[0]
        let fileCopy = JSON.parse(JSON.stringify(file))
        let index = this.fileList.indexOf(file)
        fileCopy.url = url
        fileCopy.status = 'success'
        let fileListCopy = [...this.fileList]
        fileListCopy.splice(index, 1, fileCopy)
        this.$emit('update:fileList', fileListCopy)
      },
      uploadError(name) {
        let file = this.fileList.filter(i => i.name === name)[0]
        let index = this.fileList.indexOf(file)
        let fileCopy = JSON.parse(JSON.stringify(file))
        fileCopy.status = 'fail'
        let fileListCopy = [...this.fileList]
        fileListCopy.splice(index, 1, fileCopy)
        this.$emit('update:fileList', fileListCopy)
      },
      uploadFile(rawFile) {
        let {name, size, type} = rawFile
        if(this.validateDuplicateName(name)) {
          let formData = new FormData()
          formData.append(this.name, rawFile)
          this.beforeUploadFile(rawFile)
          this.doUpdateLoadFile(formData, (res)=> {
            let url = this.parseResponse(res)
            this.url = url
            this.afterUploadFile(name, url)
          }, (err) => {
            this.uploadError(name, err)
          })
        }
      },
      validateDuplicateName(name) {
        if (this.fileList.filter(i => i.name === name).length > 0) {
          let answer = window.confirm(`请勿上传重复的文件`)
          if (answer) {
            return false
          }
        } else {
          return true
        }
      },
      createInput() {
        this.$refs.temp.innerHTML = ''
        let input = document.createElement('input')
        input.type = 'file'
        this.$refs.temp.appendChild(input)
        return input
      },
      doUpdateLoadFile (formData, success, fail) {
        let xhr = new XMLHttpRequest()
        xhr.open('POST', this.action)
        xhr.onload = () => {
          if (Math.random() > 0.5) {
            fail()
          } else {
            success(xhr.response)
          }
        }
        xhr.send(formData)
      }
    }
  }
</script>

<style lang="scss">
  @import '../../styles/common';

  .s-upload {
    &-file-list {
      list-style: none;
      > li {
        display: flex;
        align-items: center;
        margin: 8px 0;
        border: 1px solid $border-color;
      }
    }
    &-image-wrapper {
      display: flex;
      margin-right: 8px;
      .s-icon {
        margin-left: 10px;
        margin-right: 6px;
        @include spin;
      }
      .s-upload-image {
        vertical-align: top;
      }
      s-upload-default-image {
        vertical-align: top;
        border: 1px solid $border-color;
        width: 32px;
        height: 32px;
      }
    }
    &-file-name {
      color: $main-font-color;
      margin-right: auto;
      &.success {
        color: $main-success;
      }
      &.uploading {
        color: $disabled-color;
      }
      &.fail {
        color: $main-error;
      }
    }
  }
</style>