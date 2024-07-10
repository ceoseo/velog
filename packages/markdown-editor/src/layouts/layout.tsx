import { ConfigProvider } from '@/contexts'
import { MarkdownEditorProvider } from '@/contexts/markdown-editor'
import { SidebarProvider } from '@/contexts/sidebar'
import type { NextraThemeLayoutProps } from '@/nextra/types'
import type { ReactElement } from 'react'
import { InnerLayout } from './lnner-layout'
import { ModalProvider } from '@/contexts/modal'
import { Potals } from '@/components/potals'

type NextraDocLayoutProps = NextraThemeLayoutProps & {
  editorValue: string
}

export function Layout({ children, editorValue, ...context }: NextraDocLayoutProps): ReactElement {
  return (
    <ConfigProvider value={context}>
      <ModalProvider>
        <SidebarProvider>
          <MarkdownEditorProvider value={{ editorValue }}>
            <Potals />
            <InnerLayout {...context.pageOpts}>{children}</InnerLayout>
          </MarkdownEditorProvider>
        </SidebarProvider>
      </ModalProvider>
    </ConfigProvider>
  )
}
