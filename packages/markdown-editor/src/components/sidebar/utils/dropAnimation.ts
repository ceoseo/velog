import type { DropAnimation } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export const dropAnimation: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 0, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        // transform: CSS.Transform.toString({
        //   ...transform.final,
        //   x: transform.final.x + 5,
        //   y: transform.final.y + 5,
        // }),
      },
    ]
  },
  // easing: 'ease-out',
  // sideEffects({ active }) {
  //   active.node.animate([{ opacity: 0 }, { opacity: 0 }], {
  //     duration: defaultDropAnimation.duration,
  //     easing: defaultDropAnimation.easing,
  //   })
  // },
}
