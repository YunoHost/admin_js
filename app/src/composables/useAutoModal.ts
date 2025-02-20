import type { OrchestratedModal } from 'bootstrap-vue-next'
import { BModal, useModalController } from 'bootstrap-vue-next'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'
import { VueShowdown } from 'vue-showdown'

export function useAutoModal() {
  const { t } = useI18n()
  const { confirm, show } = useModalController()

  return function (
    message: string,
    props_: OrchestratedModal = {},
    { markdown = false, cancelable = true } = {},
  ) {
    const props: OrchestratedModal = {
      okTitle: t('ok'),
      cancelTitle: t('cancel'),
      centered: true,
      okOnly: !cancelable,
      ...(markdown
        ? { headerVariant: 'warning' }
        : {
            noHeader: true,
            bodyVariant: 'warning',
            bodyClass: ['fw-bold', 'rounded-top'],
          }),
      ...props_,
    }

    const fn = cancelable ? confirm : show
    return fn?.({
      props,
      component: h(BModal, null, {
        default: () =>
          markdown
            ? h(VueShowdown, {
                markdown: message,
                options: { headerLevelStart: 3 },
              })
            : message,
      }),
    })
  }
}
