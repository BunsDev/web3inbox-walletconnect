import type { PushClientTypes } from '@walletconnect/push-client'
import debounce from 'lodash.debounce'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { from } from 'rxjs'
import PlusIcon from '../../../assets/Plus.svg'
import SearchIcon from '../../../assets/Search.svg'
import SettingsContext from '../../../contexts/SettingsContext/context'
import W3iContext from '../../../contexts/W3iContext/context'
import { useColorModeValue, useIsMobile, useSearch } from '../../../utils/hooks'
import { pushSearchService, subscribeModalService } from '../../../utils/store'
import Input from '../../general/Input'
import NavLink from '../../general/NavLink'
import Search from '../../general/Search'
import MobileHeading from '../../layout/MobileHeading'
import type { IAppNotification } from '../AppNotifications/AppNotificationItem'
import Foundation from '../../../assets/foundation.svg'
import './AppSelector.scss'
import EmptyApps from './EmptyApps'

interface PushApp {
  id: string
  name: string
  description: string
  color: {
    dark: string
    light: string
  }
  logo: string
  url: string
  isMuted: boolean
  notifications?: IAppNotification[]
}

const AppSelector: React.FC = () => {
  const [search, setSearch] = useState('')
  const isMobile = useIsMobile()
  const { isPushSearchOpen } = useSearch()
  const [dropdownToShow, setDropdownToShow] = useState<string | undefined>()
  const [filteredApps, setFilteredApps] = useState<PushClientTypes.PushSubscription[]>([])
  const { mode } = useContext(SettingsContext)
  const { userPubkey: address, activeSubscriptions, pushClientProxy } = useContext(W3iContext)
  const themeColors = useColorModeValue(mode)

  const handleSubscribeModal = (id: number) => {
    const contentList = [
      {
        id: 1,
        account: address,
        metadata: {
          name: 'Foundation',
          description:
            'Foundation is a decentralized organization that supports the development of the Web3 ecosystem.',
          url: 'https://foundation.app',
          icons: [Foundation]
        }
      },
      {
        id: 2,
        account: address,
        metadata: {
          name: 'Mirror',
          description: 'Mirror is a publishing platform for thoughtful writing on the internet.',
          url: 'https://mirror.xyz',
          icons: ['https://pbs.twimg.com/profile_images/1483877855586963459/VVWXmSVk_400x400.jpg']
        }
      }
    ]

    const content = contentList.find((c: { id: number }) => c.id === id) ?? contentList[0]

    window.web3inbox.push.postMessage({
      method: 'push_request',
      jsonrpc: '2.0',
      id: Date.now(),
      params: content
    })

    subscribeModalService.toggleModal({
      ...content.metadata,
      id: content.id
    })
  }

  const filterApps = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery) {
        setFilteredApps(activeSubscriptions)

        return
      }

      const newFilteredApps = [] as PushClientTypes.PushSubscription[]

      from(activeSubscriptions).subscribe({
        next: app => {
          const isAppNameMatch = app.metadata.name.toLowerCase().includes(searchQuery)
          if (isAppNameMatch) {
            newFilteredApps.push(app)
          }
        },
        complete: () => {
          setFilteredApps(newFilteredApps)
        }
      })
    }, 50),
    []
  )

  useEffect(() => {
    filterApps(search)
  }, [search, filterApps])

  return (
    <div className="AppSelector">
      {isMobile ? (
        <div className="AppSelector__mobile-header">
          {!isPushSearchOpen && <MobileHeading>Notifications</MobileHeading>}
          <div className="AppSelector__mobile-actions">
            <Search
              setSearch={setSearch}
              isSearchOpen={isPushSearchOpen}
              openSearch={pushSearchService.openSearch}
              closeSearch={pushSearchService.closeSearch}
            />
            <NavLink to="/notifications/new-app" className="AppSelector__link">
              <img className="AppSelector__link-icon" src={PlusIcon} alt="NewApp" />
            </NavLink>
          </div>
        </div>
      ) : (
        <>
          <Input
            onChange={({ target }) => {
              setSearch(target.value)
            }}
            placeholder="Search"
            icon={SearchIcon}
          />
          <NavLink to="/notifications/new-app" className="AppSelector__link">
            <img className="AppSelector__link-icon" src={PlusIcon} alt="NewApp" />
            <span>New App</span>
          </NavLink>
          <button
            onClick={() => handleSubscribeModal(1)}
            className="AppSelector__link AppSelector__btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="AppSelector__link-icon"
            >
              <path
                fillRule="evenodd"
                d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z"
                clipRule="evenodd"
              />
              <path d="M10.076 8.64l-2.201-2.2V4.874a.75.75 0 00-.364-.643l-3.75-2.25a.75.75 0 00-.916.113l-.75.75a.75.75 0 00-.113.916l2.25 3.75a.75.75 0 00.643.364h1.564l2.062 2.062 1.575-1.297z" />
              <path
                fillRule="evenodd"
                d="M12.556 17.329l4.183 4.182a3.375 3.375 0 004.773-4.773l-3.306-3.305a6.803 6.803 0 01-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 00-.167.063l-3.086 3.748zm3.414-1.36a.75.75 0 011.06 0l1.875 1.876a.75.75 0 11-1.06 1.06L15.97 17.03a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>

            <span>Test Subscribe Foundation</span>
          </button>
          <button
            onClick={() => handleSubscribeModal(2)}
            className="AppSelector__link AppSelector__btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="AppSelector__link-icon"
            >
              <path
                fillRule="evenodd"
                d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z"
                clipRule="evenodd"
              />
              <path d="M10.076 8.64l-2.201-2.2V4.874a.75.75 0 00-.364-.643l-3.75-2.25a.75.75 0 00-.916.113l-.75.75a.75.75 0 00-.113.916l2.25 3.75a.75.75 0 00.643.364h1.564l2.062 2.062 1.575-1.297z" />
              <path
                fillRule="evenodd"
                d="M12.556 17.329l4.183 4.182a3.375 3.375 0 004.773-4.773l-3.306-3.305a6.803 6.803 0 01-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 00-.167.063l-3.086 3.748zm3.414-1.36a.75.75 0 011.06 0l1.875 1.876a.75.75 0 11-1.06 1.06L15.97 17.03a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>

            <span>Test Subscribe Mirror</span>
          </button>
        </>
      )}
      {filteredApps.map(app => (
        <NavLink
          key={app.topic}
          to={`/notifications/${app.topic}`}
          className="AppSelector__link-item"
          onMouseEnter={() => setDropdownToShow(app.topic)}
          onMouseLeave={() => setDropdownToShow(undefined)}
        >
          <div className="AppSelector__notifications">
            <div className="AppSelector__notifications-link">
              <img
                className="AppSelector__link-logo"
                src={app.metadata.icons[0]}
                alt={`${app.metadata.name} logo`}
                loading="lazy"
              />
              <span>{app.metadata.name}</span>
            </div>
            {/* DropdownToShow !== app.id &&
                app.notifications?.length &&
                app.notifications.filter(notif => notif.isRead).length !== 0 && (
                  <CircleBadge>
                    {app.notifications.filter(notif => notif.isRead).length}
                  </CircleBadge>
                )*/}
          </div>
        </NavLink>
      ))}
      {/* FilteredApps.length > 0 && (
        <div className="AppSelector__muted">
          <div className="AppSelector__muted__label">MUTED</div>
          {filteredApps.map(app => (
            <NavLink
              key={app.topic}
              to={`/notifications/${app.topic}`}
              className="AppSelector__link-item"
              onMouseEnter={() => setDropdownToShow(app.topic)}
              onMouseLeave={() => setDropdownToShow(undefined)}
            >
              <div className="AppSelector__notifications">
                <div className="AppSelector__notifications-link__muted">
                  <img
                    className="AppSelector__link-logo"
                    src={app.metadata.icons[0]}
                    alt={`${app.metadata.name} logo`}
                    loading="lazy"
                  />
                  <span>{app.metadata.name}</span>
                </div>
                <NotificationMuteIcon fillColor={themeColors['--fg-color-3']} />
              </div>
            </NavLink>
          ))}
        </div>
      )*/}
      <EmptyApps />
    </div>
  )
}

export default AppSelector
