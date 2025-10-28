<template>
  <el-col :span="element.span" :class="className" @click.stop="activeItem(element)">
    <el-form-item :label="element.label" :label-width="element.labelWidth ? element.labelWidth + 'px' : null"
      :required="element.required" v-if="element.layout === 'colFormItem'">
      <component :is="element.tag" :key="element.tag" @input="handleInput" v-model="element.defaultValue"
        :placeholder="element.placeholder" :type="element.type ? element.type : null" :style="element.style" />
    </el-form-item>
    <el-col :span='element.span' v-else>
      <el-row :gutter="element.gutter" :class="element.class" @click.stop="activeItem(element)">
        <span class="component-name"> {{ element.componentName }} </span>
        <draggable group="componentsGroup" :animation="340" :list="element.children" class="drag-wrapper" item-key="label"
          ref="draggableItemRef">
          <template #item="scoped">
            <draggable-item :key="scoped.element.renderKey" :drawing-list="element.children" :element="scoped.element"
              :index="index" :active-id="activeId" :form-conf="formConf" @activeItem="activeItem(scoped.element)"
              @copyItem="copyItem(scoped.element, element.children)"
              @deleteItem="deleteItem(scoped.index, element.children)" />
          </template>
        </draggable>
      </el-row>
    </el-col>
    <span class="drawing-item-copy" title="复制" @click.stop="copyItem(element)">
      <el-icon>
        <CopyDocument />
      </el-icon>
    </span>
    <span class="drawing-item-delete" title="删除" @click.stop="deleteItem(index)">
      <el-icon>
        <Delete />
      </el-icon>
    </span>
  </el-col>
</template>
<script setup name="DraggableItem">
import draggable from "vuedraggable/dist/vuedraggable.common";
const { proxy } = getCurrentInstance()



const props = defineProps({
  element: Object,
  index: Number,
  drawingList: Array,
  activeId: {
    type: [String, Number]
  },
  formConf: Object
})
const className = ref('')
const draggableItemRef = ref(null)
const emits = defineEmits(['activeItem', 'copyItem', 'deleteItem'])
function activeItem(item) {
  emits('activeItem', item)
}

function copyItem(item, parent) {
  emits('copyItem', item, parent ?? props.drawingList
  )
}
function deleteItem(item, parent) {
  emits('deleteItem', item, parent ?? props.drawingList)
}

function handleInput(value) {
  console.log(value);
  props.element.defaultValue = value
}

watch(() => props.activeId, (val) => {
  className.value = (props.element.layout === 'rowFormItem' ? 'drawing-row-item' : 'drawing-item') + (val === props.element.formId ? ' active-from-item' : '')
  if (props.formConf.unFocusedComponentBorder) {
    className.value += ' unfocus-bordered'
  }
}, {
  immediate: true
})
</script>