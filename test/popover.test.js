const expect = chai.expect;
import Vue from 'vue'
import Popover from '../src/popover'

Vue.config.productionTip = false
Vue.config.devtools = false

describe('Popover', () => {
    it('存在.', () => {
        expect(Popover).to.exist
    })
    it('可以设置 position', (done) => {
        Vue.component('g-popover', Popover)
        const div = document.createElement('div')
        document.body.appendChild(div)
        div.innerHTML = `
            <g-popover position="bottom" ref="popover">
                <template slot="content">
                    <div>内容</div>
                </template>
                <template>
                    <button>bottom点我</button>
                </template>
            </g-popover>
        `
        const vm = new Vue({
            el: div
        })
        vm.$nextTick(() => {
            vm.$el.querySelector('button').click()
            vm.$nextTick(() => {
                let contentWrapper = vm.$refs.popover.$refs.contentWrapper
                expect(contentWrapper.classList.contains('position-bottom')).to.be.true
                done()
            })
        })
    })
})