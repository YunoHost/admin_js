<script setup lang="ts">
import type {
  AnyTreeNode,
  TreeChildNode,
  TreeRootNode,
} from '@/helpers/data/tree'

const props = withDefaults(
  defineProps<{
    tree: AnyTreeNode
    flush?: boolean
    last?: boolean
    toggleText?: string
  }>(),
  {
    flush: false,
    last: undefined,
    toggleText: undefined,
  },
)

type NodeSlot = {
  [K in keyof TreeChildNode as TreeChildNode[K] extends (
    callback: (node: AnyTreeNode, index: number, root: TreeRootNode) => boolean,
  ) => AnyTreeNode
    ? never
    : K]: TreeChildNode[K]
}

defineSlots<{
  default: (props: NodeSlot) => any
}>()

function getClasses(node: AnyTreeNode, i: number) {
  const children = node.height > 0
  const opened = children && node.data?.opened
  const last =
    props.last !== false &&
    (!children || !opened) &&
    i === props.tree.children.length - 1
  return { collapsible: children, uncollapsible: !children, opened, last }
}
</script>

<template>
  <BListGroup :flush="flush" :style="{ '--depth': tree.depth }">
    <template v-for="(node, i) in tree.children" :key="node.id">
      <BListGroupItem
        class="list-group-item-action"
        :class="getClasses(node, i)"
        @click="$router.push(node.data.to)"
      >
        <slot name="default" v-bind="node as NodeSlot" />

        <BButton
          v-if="node.height > 0"
          size="xs"
          variant="outline-secondary"
          :aria-expanded="node.data.opened ? 'true' : 'false'"
          :aria-controls="'collapse-' + node.id"
          :class="node.data.opened ? 'not-collapsed' : 'collapsed'"
          class="ms-2"
          @click.stop="node.data.opened = !node.data.opened"
        >
          <span class="visually-hidden">{{ toggleText }}</span>
          <YIcon iname="chevron-right" />
        </BButton>
      </BListGroupItem>

      <BCollapse
        v-if="node.height > 0"
        :id="'collapse-' + node.id"
        v-model="node.data.opened"
      >
        <RecursiveListGroup
          :tree="node"
          :last="last !== undefined ? last : i === tree.children.length - 1"
          flush
        >
          <!-- PASS THE DEFAULT SLOT WITH SCOPE TO NEXT NESTED COMPONENT -->
          <template #default="scope">
            <slot name="default" v-bind="scope" />
          </template>
        </RecursiveListGroup>
      </BCollapse>
    </template>
  </BListGroup>
</template>

<style lang="scss" scoped>
.list-group {
  .collapse {
    &:not(.show) + .list-group-item {
      border-end-start-radius: $border-radius;
    }
    &.show + .list-group-item {
      border-start-start-radius: $border-radius;
    }

    + .list-group-item {
      border-block-start-width: 1px !important;
    }
  }

  &-item {
    &-action {
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: unset;
    }

    &.collapsible.opened {
      border-end-start-radius: $border-radius;
    }
    &.collapsible:not(.opened, .last) {
      border-block-end-width: 0;
    }

    &.last {
      border-block-end-width: $list-group-border-width;
      border-end-start-radius: $border-radius;
    }
  }

  &-flush .list-group-item {
    margin-inline-start: calc(1rem * var(--depth));
    border-inline-end: $list-group-border-width solid $list-group-border-color;
    border-inline-start: $list-group-border-width solid $list-group-border-color;
    text-decoration: none;
    background-color: $list-group-hover-bg;

    &:hover,
    &:focus {
      background-color: shade-color($body-tertiary-bg, 3%);

      [data-bs-theme='dark'] & {
        background-color: tint-color($body-tertiary-bg-dark, 3%);
      }
    }
  }
}
</style>
