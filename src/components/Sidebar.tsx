import * as Dialog from '@radix-ui/react-dialog'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { css } from '../../styled-system/css'
import { token } from '../../styled-system/tokens/index.mjs'
import { longPressActionCreator as longPress } from '../actions/longPress'
import { toggleSidebarActionCreator } from '../actions/toggleSidebar'
import { LongPressState } from '../constants'
import viewportStore from '../stores/viewport'
import durations from '../util/durations'
import fastClick from '../util/fastClick'
import FadeTransition from './FadeTransition'
import Favorites from './Favorites'
import { ProgressiveBlur } from './ProgressiveBlur'
import RecentlyDeleted from './RecentlyDeleted'
import RecentlyEdited from './RecentlyEdited'

type SidebarSection = 'favorites' | 'recentEdited' | 'deletedEdited'

/** A link to a sidebar section. */
const SidebarLink = ({
  active,
  section,
  setSection,
  text,
}: {
  active?: boolean
  section: SidebarSection
  setSection: (section: SidebarSection) => void
  text: string
}) => {
  return (
    <a
      {...fastClick(() => setSection(section))}
      data-testid={`sidebar-${section}`}
      className={css({
        color: active ? 'fg' : 'gray50',
        display: 'inline-block',
        fontSize: '1.2em',
        fontWeight: 600,
        margin: '0.5em 1em 0 0',
        textDecoration: 'none',
      })}
    >
      {text}
    </a>
  )
}

/** The sidebar component. */
const Sidebar = () => {
  const [isSwiping, setIsSwiping] = useState(false)
  const showSidebar = useSelector(state => state.showSidebar)
  const fontSize = useSelector(state => state.fontSize)
  const dispatch = useDispatch()
  const [section, setSection] = useState<SidebarSection>('favorites')
  const innerWidth = viewportStore.useSelector(state => state.innerWidth)

  /** Dynamically determine the width of the sidebar. */
  const width = innerWidth < token('breakpoints.xl') ? '90%' : '400px'

  /** Get the width of the sidebar in pixels, which is used for progress-based animations. */
  const widthPx = innerWidth < token('breakpoints.xl') ? innerWidth * 0.9 : 400

  /** Track the current x position of the sidebar. This is used for progress-based animations. */
  const x = useMotionValue(showSidebar ? 0 : -widthPx)

  /** Toggle the sidebar. */
  const toggleSidebar = useCallback(
    (value: boolean) => {
      dispatch([toggleSidebarActionCreator({ value })])
    },
    [dispatch],
  )

  /** MUI-style cubic-bezier transition. */
  const transition = {
    duration: durations.get('fast') / 1000,
    ease: [0, 0, 0.2, 1] as const,
  }

  /** Lock body scroll when sidebar is open. */
  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showSidebar])

  /** Watch for the escape key. Make sure the listener is only initialized when the sidebar is open,
   * and cleaned up when the sidebar is closed.
   */
  useEffect(() => {
    if (!showSidebar) return

    /** Watch for esc key. We handle this manually instead of letting Radix
     * to make sure the current selection in the editor is kept when esc is hit. */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggleSidebar(false)
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showSidebar, toggleSidebar])

  return (
    <>
      <Dialog.Root open={showSidebar} onOpenChange={toggleSidebar} modal={false}>
        {/* forceMount prop keeps the sidebar mounted when closed.
        this is temporarily added to match the behavior of the outgoing MUI drawer
        it can be removed in a later PR to optimize performance */}
        <Dialog.Portal forceMount>
          <div
            data-testid='sidebar'
            aria-hidden={!showSidebar}
            className={css({
              position: 'fixed',
              inset: 0,
              zIndex: 'sidebar',
              pointerEvents: 'none',
              userSelect: 'none',
            })}
          >
            <SidebarBackground
              x={x}
              widthPx={widthPx}
              showSidebar={showSidebar}
              toggleSidebar={toggleSidebar}
              width={width}
              innerWidth={innerWidth}
            />

            <Dialog.Content
              asChild
              forceMount
              onInteractOutside={e => e.preventDefault()} // This is needed to prevent the sidebar from double-toggling when tapping hamburger icon
              onEscapeKeyDown={e => e.preventDefault()} // Stop Radix from closing the sidebar when esc is pressed – we will handle it ourselves
            >
              <motion.div
                style={{ x }}
                drag='x'
                dragConstraints={{ left: -widthPx, right: 0 }}
                dragElastic={1e-9} // This disables elastic overscroll.
                onDragStart={() => setIsSwiping(true)}
                onDragEnd={(e, info) => {
                  setIsSwiping(false)

                  // Check that the swipe meets the threshold to close.
                  // The swipe either needs to be at least 100px or have a velocity of at least 500px/s.
                  if (info.offset.x < -100 || info.velocity.x < -500) {
                    toggleSidebar(false)
                  } else {
                    // Snap back to 0
                    animate(x, 0, transition)
                  }
                }}
                initial={false}
                animate={{ x: showSidebar ? 0 : -widthPx }}
                transition={transition}
                className={css({
                  position: 'fixed',
                  top: 'safeAreaTop',
                  left: 0,
                  bottom: 0,
                  width,
                  backgroundColor: 'transparent',
                  zIndex: 'sidebar',
                  userSelect: 'none',
                  outline: 'none',
                  pointerEvents: 'auto',
                })}
              >
                <div
                  // We need to disable favorites drag-and-drop when the Sidebar is being slid close.
                  // We'll do this by checking the sidebar's x offset.
                  onTouchMove={_.throttle(
                    () => {
                      if (isSwiping) return
                      // If the sidebar's x-offset is 0, the sidebar isn't moving.
                      // Otherwise, it -is- moving, and we should disable drag-and-drop by setting isSwiping.
                      if (x.get() !== 0) {
                        setIsSwiping(true)
                        dispatch(longPress({ value: LongPressState.Inactive }))
                      }
                    },
                    10,
                    // no need to check on the first touchmove trigger since x has probably not changed yet
                    { leading: false },
                  )}
                  onTouchEnd={() => {
                    setIsSwiping(false)
                  }}
                  className={css({ height: '100%' })}
                >
                  <div
                    aria-label='sidebar'
                    className={css({
                      background: 'transparent',
                      overflowY: 'scroll',
                      overflowX: 'hidden',
                      overscrollBehavior: 'contain',
                      boxSizing: 'border-box',
                      width: '100%',
                      height: '100%',
                      color: 'fg',
                      scrollbarWidth: 'thin',
                      lineHeight: 1.8,
                      '&::-webkit-scrollbar': {
                        width: '0px',
                        background: 'transparent',
                        display: 'none',
                      },
                      userSelect: 'none',
                      // must be position:relative to ensure drop hovers are positioned correctly when sidebar is scrolled
                      position: 'relative',
                      padding: '0 1em',
                    })}
                    data-scroll-at-edge
                  >
                    <FadeTransition type='fast' in={showSidebar}>
                      <div
                        style={{
                          // match HamburgerMenu width + padding
                          marginLeft: fontSize * 1.3 + 30,
                        }}
                      >
                        <SidebarLink
                          active={section === 'favorites'}
                          section='favorites'
                          setSection={setSection}
                          text='Favorites'
                        />
                        <SidebarLink
                          active={section === 'recentEdited'}
                          section='recentEdited'
                          setSection={setSection}
                          text='Recently Edited'
                        />
                        <SidebarLink
                          active={section === 'deletedEdited'}
                          section='deletedEdited'
                          setSection={setSection}
                          text='Recently Deleted'
                        />
                      </div>
                    </FadeTransition>

                    {section === 'favorites' ? (
                      <Favorites disableDragAndDrop={isSwiping} />
                    ) : section === 'recentEdited' ? (
                      <RecentlyEdited />
                    ) : section === 'deletedEdited' ? (
                      <RecentlyDeleted />
                    ) : (
                      'Not yet implemented'
                    )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

/** The sidebar background component with progressive blur and gradient. */
const SidebarBackground = ({
  x,
  widthPx,
  showSidebar,
  toggleSidebar,
  width,
  innerWidth,
}: {
  x: any
  widthPx: number
  showSidebar: boolean
  toggleSidebar: (value: boolean) => void
  width: string
  innerWidth: number
}) => {
  const opacity = useTransform(x, [-widthPx, 0], [0, 1])

  const xlValue = token('breakpoints.xl')
  const xl = parseInt(xlValue, 10)
  const isMobile = innerWidth < xl
  const backgroundWidth = isMobile ? '100%' : width

  return (
    <div
      className={css({
        position: 'fixed',
        inset: 0,
        zIndex: 'sidebar',
        pointerEvents: 'none',
      })}
    >
      {/* Fixed Gradient Layer */}
      <motion.div
        aria-label='sidebar-gradient'
        aria-hidden='true'
        style={{ opacity }}
        onClick={() => toggleSidebar(false)}
        className={css({
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(10, 10, 18, 1) 0%, {colors.bgTransparent} 100%)',
          width: backgroundWidth,
          pointerEvents: showSidebar ? 'auto' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        })}
      />

      {/* Sliding Progressive Blur Layer */}
      <motion.div
        aria-label='sidebar-blur'
        aria-hidden='true'
        style={{ x }}
        className={css({
          position: 'absolute',
          inset: 0,
          width: backgroundWidth,
          pointerEvents: 'none',
        })}
      >
        <ProgressiveBlur direction='to right' maxBlur={32} layers={16} width={backgroundWidth} />
      </motion.div>
    </div>
  )
}

export default Sidebar
