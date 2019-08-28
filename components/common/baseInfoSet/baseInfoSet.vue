<template>
  <div>
    <el-dialog width="910px" custom-class="setBaseInfoDialog" title="" :visible.sync="baseInfoSet" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
      <div class="dialog_setBaseInfo clearfix">
        <div class="bannar"></div>
        <div class="baseInfoForm">
          <h2 class="baseInfo_title">请填写基本信息</h2>
          <p v-if="!isEnterprise" class="baseInfo_text">您可以稍后在我的账号中完善信息，完善后可申请平台认证， 成为认证译员，领取海量平台任务！</p>
          <p v-else class="baseInfo_text">您可以稍后在我的账号中完善更多信息，让工作伙伴更加全面的了解您！</p>
          <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="baseInfo-ruleForm" style="height: 330px;overflow-y: auto;">
            <el-form-item label="昵称" prop="nickName"><el-input v-model="ruleForm.nickName" name="nickName" placeholder="为自己取一个响亮的昵称吧" clearable style="width: 330px;"></el-input></el-form-item>
            <el-form-item label="工作标签" required style="margin-bottom: 0;">
              <el-button v-popover:chooseLabel type="primary">选择标签</el-button>
              <!--已选择的标签-->
              <el-tag v-for="tag in checkedLabels.slice(0,3)" type="info" class="already-el-tag-label" size="small" :key="tag" closable :disable-transitions="false" @close="handleClose(tag)">{{tag}}</el-tag>
              <!--选择标签弹框-->
              <el-popover ref="chooseLabel" placement="bottom-start" width="583" trigger="click" popper-class="baseInfo_popper" >
                <p class="baseInfo_best5">最多可选择5个标签</p>
                <el-checkbox-group v-model="checkedLabels" :min="0" :max="5">
                  <el-checkbox  class="el-checkbox-choose" name="checkedLabels"  v-for="item in allLabelData" :key="item.labelId" :value="item.labelId" :label="item.labelName" :disabled="checkedLabels.indexOf(item.labelName)<=-1&&checkedLabels.length === 5">{{item.labelName}}</el-checkbox>
                </el-checkbox-group>
              </el-popover>

            </el-form-item>
            <!-- 超出5个换行 -->
            <el-form-item v-if="checkedLabels.length > 3" style="margin-bottom: 0;">
              <el-tag v-for="tag in checkedLabels.slice(3,5)" type="info" class="already-el-tag-label" size="small" :key="tag" closable :disable-transitions="false" @close="handleClose(tag)"> {{tag}} </el-tag>
            </el-form-item>

            <el-form-item label="语言对" required class="choose-lang-form-item" style="margin-top: 22px;margin-bottom: 0">
              <el-select size="small" v-model="itemSourceLangs[0]" name="itemSourceLangs" placeholder="请选择"><el-option v-for="(item, index) in allLangData" :key="index" :label="item.dictionaryValue" :value="item.dictionaryKey"></el-option></el-select>
              <span class="right-jiantou">→</span>
              <el-select size="small" v-model="itemTargetLangs[0]" name="itemTargetLangs" placeholder="请选择"><el-option v-for="(item, index) in allLangData" :key="index" :label="item.dictionaryValue" :value="item.dictionaryKey"></el-option></el-select>
              <el-button v-if="itemSourceLangs.length > 1" type="text" @click="deleteThisLang(0)" class="delete-lang" name="delete-lang">删除</el-button>
            </el-form-item>

            <div v-if="itemSourceLangs.length > 1">
              <el-form-item v-for="item in (itemSourceLangs.length -1)" :key="item" class="choose-lang-form-item" style="margin-top: 22px;margin-bottom: 0;">
                <el-select size="small" v-model="itemSourceLangs[item]" name="itemSourceLangs" placeholder="请选择"><el-option v-for="(item, index) in allLangData" :key="index" :label="item.dictionaryValue" :value="item.dictionaryKey"></el-option></el-select>
                <span class="right-jiantou">→</span>
                <el-select size="small" v-model="itemTargetLangs[item]" name="itemTargetLangs" placeholder="请选择"><el-option v-for="(item, index) in allLangData" :key="index" :label="item.dictionaryValue" :value="item.dictionaryKey"></el-option></el-select>
                <el-button type="text" @click="deleteThisLang(item)" class="delete-lang" name="delete-lang">删除</el-button>
              </el-form-item>
            </div>

            <el-form-item>
              <el-button v-if="isAddLanguageBtn" type="text" icon="el-icon-circle-plus-outline" @click="addLanguage" name="addLanguage">添加语言对</el-button>
            </el-form-item>

            <el-form-item><el-button type="primary" @click="submitForm" name="submitForm" style="width: 330px;">完成</el-button></el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'baseInfoSet',
  data () {
    let checkNickName = (rule, value, callback) => {
      let _this = this
      let url = _this.isEnterprise ? '/enterprise/projectManager/textCheck' : '/personal/projectManager/textCheck'
      _this.reqServiceOf3(url, {content: value}, 'POST').then((res) => {
        if (Number(res.code) !== 200) {
          if (res.message.indexOf('特殊') >= 0) {
            callback(new Error('模板名称不能' + res.message))
          } else if (res.message.indexOf('敏感') >= 0) {
            callback(new Error('模板名称中' + res.message))
          } else {
            callback()
          }
        } else {
          callback()
        }
      })
    }
    let checkNickNameIsSample = (rule, value, callback) => {
      let _this = this
      let url = _this.isEnterprise ? '/enterprise/frame/queryByNickName.do' : '/personal/frame/queryByNickName.do'
      _this.reqServiceOf2(url, {nickName: value}, 'POST').then((res) => {
        let data = typeof (res) !== 'object' ? JSON.parse(res) : res
        if (Number(data.code) !== 200) {
          callback(new Error(data.message))
        } else {
          callback()
        }
      })
    }
    let LOGIN_INFO = JSON.parse(localStorage.getItem('LOGIN_INFO'))
    return {
      allLangData: [], // 所有的语言对
      allLabelData: [], // 所有标签
      checkedLabels: [], // 已经选择的标签
      itemSourceLangs: [''],
      itemTargetLangs: [''],
      ruleForm: {
        userId: LOGIN_INFO.result.userId,
        nickName: '',
        labelIds: '',
        language: ''
      },
      rules: {
        nickName: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 1, max: 20, message: '昵称设置过长，昵称限制20个字符', trigger: 'blur' },
          { validator: checkNickName, trigger: 'blur' },
          { validator: checkNickNameIsSample, trigger: 'blur' }
        ]
      },
      isEnterprise: false,
      isAddLanguageBtn: true
    }
  },
  props: {
    // 是否打开弹框
    baseInfoSet: {
      type: Boolean,
      default: false
    }
  },
  created () {
    // 判断是企业版还是个人版
    this.isEnterprise = this.$route.path && this.$route.path.indexOf('/enterprise') > -1

    // 得到语言对
    this.allLangData = this.$utils.getLanguageList()
    // 得到所有标签
    this.allLabelData = this.$store.state.enterprice.getLabelListData

    // 获取userId
    this.getUserId()
  },
  watch: {
    '$store.state.enterprice.getLanguageMapData' () {
      this.allLangData = this.$utils.getLanguageList()
    },
    '$store.state.enterprice.getLabelListData' () {
      this.allLabelData = this.$store.state.enterprice.getLabelListData
    }
  },
  methods: {
    /**
    * 点击删除已经选择的标签
    * */
    handleClose (tag) {
      this.checkedLabels.splice(this.checkedLabels.indexOf(tag), 1)
    },
    /**
    * 点击删除目前语言对
    * */
    deleteThisLang (index) {
      this.itemSourceLangs.splice(index, 1)
      this.itemTargetLangs.splice(index, 1)
      if (this.itemSourceLangs.length < 10) {
        this.isAddLanguageBtn = this.itemSourceLangs.length !== 9
      }
    },
    /**
    * 点击添加语言对
    * */
    addLanguage () {
      if (this.itemSourceLangs.length < 10) {
        this.itemSourceLangs.push('')
        this.itemTargetLangs.push('')
        this.isAddLanguageBtn = this.itemSourceLangs.length !== 9
      }
    },
    /**
    * 提交基本设置
    * */
    submitForm () {
      let _this = this
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          // 验证标签
          if (_this.checkedLabels.length === 0) {
            _this.$message.error('请选择标签')
            return
          }
          // 验证语言对
          let isPass = false
          if (_this.itemSourceLangs.length > 0 && _this.itemTargetLangs.length > 0) {
            for (let i = 0; i < _this.itemSourceLangs.length; i++) {
              if (_this.itemSourceLangs[i] !== '' && _this.itemTargetLangs[i] !== '') {
                if (_this.itemSourceLangs[i] === _this.itemTargetLangs[i]) {
                  isPass = false
                  _this.$message.error('不能使用同种语言翻译')
                  return
                } else {
                  isPass = true
                }
              } else {
                isPass = false
                if (_this.itemSourceLangs[i] === '' && _this.itemTargetLangs[i] === '') {
                  _this.$message.error('不能使用同种语言翻译')
                } else {
                  _this.$message.error(_this.itemSourceLangs[i] === '' ? '请选择源语言' : '请选择目标语言')
                }
              }
            }
          } else {
            isPass = false
            if (_this.itemSourceLangs.length === 0) {
              _this.$message.error('请选择源语言')
            } else if (_this.itemTargetLangs.length === 0) {
              _this.$message.error('请选择目标语言')
            } else {
              _this.$message.error('语言对最少选择1种')
            }
            return
          }
          /**
           * 验证通过
           * 提交基本数据
           * userId: 用户id
           * nickName: 用户昵称
           * labelIds: 标签
           * language: 语言对
           * */
          _this.ruleForm.labelIds = _this.formatLabelValue(_this.checkedLabels)
          _this.ruleForm.language = _this.formatLangsValue(_this.itemSourceLangs, _this.itemTargetLangs)
          if (isPass && _this.ruleForm.language) {
            if (this.isEnterprise) {
              _this.reqServiceOf2('/enterprise/frame/saveBaseInfo.do', _this.ruleForm, 'POST').then((res) => {
                let data = typeof (res) !== 'object' ? JSON.parse(res) : res
                if (Number(data.code) === 200) {
                  _this.reqServiceOf2('/enterprise/user/userTeam', {}, 'POST').then((res) => {
                    if (res && Number(res.code) === 200) {
                      window.localStorage.setItem('setRegBaseInfo', 'false')
                      this.$emit('closeBaseInfoSetDialog')
                      // 更新nav用户信息
                      _this.$store.dispatch('enterprice/GetInfo').then((res) => {})
                    }
                  })
                } else {
                  _this.$message.error(data.message)
                }
              })
            } else {
              _this.reqServiceOf2('/personal/frame/saveBaseInfo.do', _this.ruleForm, 'POST').then((res) => {
                let data = typeof (res) !== 'object' ? JSON.parse(res) : res
                if (Number(data.code) === 200) {
                  _this.reqServiceOf2('/personal/user/userTeam', {}, 'POST').then((res) => {
                    if (res && Number(res.code) === 200) {
                      // 更新主页用户信息
                      _this.reqServiceOf2('/personal/frame/personalHome', {}).then((res) => {
                        if (res && Number(res.code) === 200) {
                          _this.$store.commit('personal/userInfo/mutationsUserInfo', res.result)
                          window.sessionStorage['p_u_personalUser'] = JSON.stringify({result: res.result.user})
                          window.localStorage.setItem('setRegBaseInfo', 'false')
                          this.$emit('closeBaseInfoSetDialog')
                        }
                      })
                      // 更新nav用户信息
                      _this.$store.dispatch('personal/userInfo/GetInfo').then((res) => {})
                    }
                  })
                } else {
                  _this.$mesaage.error(data.message)
                }
              })
            }
          }
        } else {
          return false
        }
      })
    },
    /**
    * arr { Array }
    * 通过标签名称找id
    * */
    formatLabelValue (arr) {
      let newArr = []
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < this.allLabelData.length; j++) {
          if (arr[i] === this.allLabelData[j].labelName) {
            newArr.push(this.allLabelData[j].labelId + '_' + this.allLabelData[j].labelName)
          }
        }
      }
      return newArr.join(',')
    },
    formatLabelValue2Arr (value) {
      let arr = (value && value.split(',')) || []
      let newArr = []
      for (let i = 0; i < arr.length; i++) {
        let index = arr[i].indexOf('_') + 1
        newArr.push(arr[i].substr(index))
      }
      return newArr
    },
    /**
   * source { Array } 源语言数组
   * target { Array } 根语言数组
   * 通过语言对名称找id
   * */
    formatLangsValue (source, target) {
      let resLanguages = ''
      for (let i = 0; i < source.length; i++) {
        let sourceKey = source[i]
        let targetKey = target[i]
        let language = sourceKey + '_' + targetKey
        if (!sourceKey && !targetKey) {
          this.$message.error('语言对不能为空')
          return false
        }
        if (resLanguages.indexOf(language) >= 0) {
          this.$message.error('选择的语言对与之前的相同')
          return false
        }
        resLanguages += language + ','
      }
      return resLanguages.substr(0, resLanguages.lastIndexOf(','))
    },
    formatLangsValue2Arr (value) {
      let source = []
      let target = []
      let arr = (value && value.split(',')) || []
      for (let i = 0; i < arr.length; i++) {
        let index = arr[i].indexOf('_')
        source.push(arr[i].substr(0, index))
        target.push(arr[i].substr(index + 1))
      }
      return [source, target]
    },
    // 获取userId
    getUserId () {
      let url = this.isEnterprise ? '/enterprise/frame/baseInfoSetPage' : '/personal/frame/baseInfoSetPage'
      this.reqServiceOf2(url, {}).then((res) => {
        if (res) {
          this.ruleForm.userId = this.ruleForm.userId || (res.user && res.user.userId)
          this.ruleForm.nickName = (res.result && res.result.user) ? res.result.user.nickName : this.ruleForm.nickName
          this.checkedLabels = (res.result && res.result.user) ? this.formatLabelValue2Arr(res.result.user.labelIds) : this.checkedLabels
          this.itemSourceLangs = (res.result && res.result.user) ? this.formatLangsValue2Arr(res.result.user.language)[0] : this.itemSourceLangs
          this.itemTargetLangs = (res.result && res.result.user) ? this.formatLangsValue2Arr(res.result.user.language)[1] : this.itemTargetLangs
        }
      })
    }
  },
  watch: {
    '$store.state.enterprice.getLanguageMapData' () {
      this.allLangData = this.$store.state.enterprice.getLanguageMapData
    },
    '$store.state.enterprice.getLabelListData' () {
      this.allLabelData = this.$store.state.enterprice.getLabelListData
    }
  }
}
</script>

<style scoped lang="less">
  .clearfix:after {
    content: "";
    display: block;
    clear: both;
    visibility: hidden;
    line-height: 0;
    height: 0;
  }
  .dialog_setBaseInfo{
    height: 561px;
    .bannar{
      float: left;
      width: 326px;
      height: 100%;
      background: url('../../../assets/img/home/reg_banner.png') center no-repeat;
      background-size: 100% 100%;
      box-shadow:2px 0px 6px 0px rgba(0,0,0,0.11);
    }
    .baseInfoForm{
      float: left;
      width: 540px;
      padding: 30px 10px 30px 30px;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      .baseInfo_title{
        text-align: center;
        font-size:20px;
        font-weight:bold;
        color:rgba(0,0,0,0.85);
        line-height:30px;
        margin: 30px 0 15px;
      }
      .baseInfo_text{
        font-size:14px;
        color:rgba(96,98,102,1);
        line-height:24px;
        word-wrap:break-word;
        word-break:break-all;
        white-space: normal;
        text-align: center;
        padding: 0 50px;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
      }
      .baseInfo-ruleForm{
        margin-top: 35px;
        .already-el-tag-label {
          margin: 0 5px;
        }
        .right-jiantou {
          display: inline-block;
          width: 24px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          border-radius: 3px;
          margin: 0 5px;
        }
        .delete-lang{
          font-size:14px;
          color:rgba(245,108,108,1);
          margin-left: 7px;
        }
      }
    }
  }
</style>
<style lang="less">
  .setBaseInfoDialog{
    .el-dialog__header{
      padding: 0;
    }
    .el-dialog__body{
      padding: 0;
    }
    .el-select{
      width: 144px;
      .el-input{
        width: 100%;
      }
    }
  }
  .baseInfo_popper {
    padding: 18px 20px 10px;
    .baseInfo_best5{
      font-size:14px;
      color:rgba(48,49,51,1);
      line-height:20px;
      margin-bottom: 5px;
    }
    .el-checkbox-choose {
      width: 80px;
      margin: 5px 15px 5px 0;
      height: 20px;
      line-height: 20px;
    }
  }
</style>
