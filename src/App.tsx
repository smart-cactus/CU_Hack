import { useState, type ReactNode } from 'react'

type Screen = 'home' | 'waiting' | 'delayed' | 'notArrived' | 'offline' | 'arrival' | 'wrongCode' | 'doorOpen' | 'inside' | 'trip' | 'complete'
type DriveEvent = 'stop' | 'detour' | 'offRoute' | 'waiting'
type CabinIssue = 'unwell' | 'door' | 'object'
type LostItem = 'Телефон или документы' | 'Сумка или рюкзак' | 'Другая вещь'
type Panel = 'trust' | 'help' | 'deliveryHelp' | 'lostItem' | 'lostItemSent' | 'voice' | 'operator' | 'fieldStaff' | 'explanations' | 'plans' | 'routeChanged' | 'safeStop' | 'safeStopConfirmed' | 'doorReopened' | 'feedback' | 'cabin' | 'incidentResult'

const vehicle = { model: 'Hyundai Sonata', plate: 'А 328 МР', region: '116', colour: 'Белый', eta: '3 мин' }
const safeStopOptions = [
  { name: 'Страстной бульвар, 4', details: '120 м · 2 мин', note: 'Разрешённая зона высадки' },
  { name: 'Пушкинская площадь', details: '260 м · 4 мин', note: 'У входа в метро' },
  { name: 'Тверской бульвар, 14', details: '340 м · 5 мин', note: 'Удобно для выхода с багажом' },
]

const driveEvents: Record<DriveEvent, { icon: string; label: string; title: string; text: string; reassurance: string }> = {
  stop: {
    icon: 'Ⅱ', label: 'ОСТАНОВКА', title: 'Останавливаемся перед переходом',
    text: 'Пешеходы переходят дорогу. Продолжим движение, когда путь будет свободен.',
    reassurance: 'Вам ничего не нужно делать.',
  },
  detour: {
    icon: '↗', label: 'ОБЪЕЗД', title: 'Объезжаем дорожные работы',
    text: 'На пути перекрыт участок дороги. Построили безопасный объезд — поездка станет дольше на 2 минуты.',
    reassurance: 'Стоимость поездки не изменится.',
  },
  offRoute: {
    icon: '⌁', label: 'МАРШРУТ ОБНОВЛЁН', title: 'Немного отклоняемся от маршрута',
    text: 'Выбрали соседнюю полосу, чтобы безопасно пропустить спецтранспорт и не стоять в потоке.',
    reassurance: 'Пункт назначения остаётся прежним.',
  },
  waiting: {
    icon: '◷', label: 'ОЖИДАНИЕ', title: 'Ждём, пока освободится проезд',
    text: 'Впереди манёвр другого автомобиля. Подождём до 40 секунд, затем продолжим маршрут.',
    reassurance: 'Мы сообщим, если ожидание затянется.',
  },
}

const cabinIssues: Record<CabinIssue, { icon: string; title: string; text: string; action: string }> = {
  unwell: {
    icon: '✚', title: 'Вам плохо',
    text: 'Автомобиль плавно остановится в безопасном месте. Оператор уже подключается и при необходимости вызовет помощь.',
    action: 'Связываем с оператором',
  },
  door: {
    icon: '↔', title: 'Дверь не открывается',
    text: 'Повторно разблокируем дверь. Если это не поможет, оператор откроет её удалённо и останется на связи.',
    action: 'Повторно разблокировать',
  },
  object: {
    icon: '!', title: 'В салоне посторонний предмет',
    text: 'Не трогайте предмет. Автомобиль выберет безопасное место для остановки, а оператор подскажет, что делать дальше.',
    action: 'Сообщить оператору',
  },
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [panel, setPanel] = useState<Panel | null>(null)
  const [driveEvent, setDriveEvent] = useState<DriveEvent>('stop')
  const [cabinIssue, setCabinIssue] = useState<CabinIssue>('unwell')
  const [destination, setDestination] = useState('ул. Тверская, 12')
  const [routePrice, setRoutePrice] = useState('420 ₽')
  const [voiceActive, setVoiceActive] = useState(false)
  const [operatorConnected, setOperatorConnected] = useState(false)
  const [fieldStaffRequested, setFieldStaffRequested] = useState(false)
  const [lostItem, setLostItem] = useState<LostItem>('Телефон или документы')
  const [selectedSafeStop, setSelectedSafeStop] = useState(safeStopOptions[0])
  const [feedback, setFeedback] = useState<'clear' | 'unclear' | null>(null)

  const reset = () => {
    setPanel(null)
    setScreen('home')
    setDriveEvent('stop')
    setDestination('ул. Тверская, 12')
    setRoutePrice('420 ₽')
    setVoiceActive(false)
    setOperatorConnected(false)
    setFieldStaffRequested(false)
    setLostItem('Телефон или документы')
    setSelectedSafeStop(safeStopOptions[0])
    setFeedback(null)
  }
  const chooseEvent = (event: DriveEvent) => { setDriveEvent(event); setPanel(null) }
  const showIssue = (issue: CabinIssue) => { setCabinIssue(issue); setPanel('incidentResult') }
  const currentEvent = driveEvents[driveEvent]
  const currentIssue = cabinIssues[cabinIssue]

  return (
    <main className="app-shell">
      <section className="phone" aria-label="Прототип беспилотного такси">
        <header className="status-bar"><span>9:41</span><span className="status-icons">● ● ●</span></header>

        {screen === 'home' && (
          <ScreenFrame step="Первый рейс">
            <div className="hero-mark" aria-hidden="true">↗</div>
            <p className="eyebrow">БЕСПИЛОТНОЕ ТАКСИ</p>
            <h1>В поездке всё под контролем</h1>
            <p className="lead">Машина подскажет, где её найти, как сесть и где получить помощь.</p>
            <button className="trust-link" onClick={() => setPanel('trust')}>До заказа: узнайте, кто поможет в дороге <span>→</span></button>
            <div className="trust-list">
              <TrustItem icon="⌁" text="Машина заранее объяснит манёвр" />
              <TrustItem icon="⌕" text="Своё авто узнаете по номеру и свету" />
              <TrustItem icon="◌" text="Оператор поможет одним нажатием" />
            </div>
            <button className="button button-primary" onClick={() => setScreen('waiting')}>Заказать поездку</button>
          </ScreenFrame>
        )}

        {screen === 'waiting' && (
          <ScreenFrame step="Машина едет к вам" className="waiting-screen" onHelp={() => setPanel('help')}>
            <div className="trip-card"><div><p className="card-label">ПОДАЧА</p><h2>ул. Большая Дмитровка, 1</h2></div><div className="eta">{vehicle.eta}</div></div>
            <div className="route-illustration" aria-hidden="true"><span className="map-dot dot-start"></span><span className="route-line"></span><span className="car-icon">▰</span><span className="map-dot dot-end"></span></div>
            <div className="info-panel"><p className="eyebrow">КАК ВЫ УЗНАЕТЕ АВТО</p><h2>{vehicle.colour} {vehicle.model}</h2><p>На крыше загорится синяя полоса. Не нужно искать водителя.</p></div>
            <button className="button button-primary" onClick={() => setScreen('arrival')}>Машина приехала</button>
            <button className="delivery-help-button" onClick={() => setPanel('deliveryHelp')}><span aria-hidden="true">?</span><strong>Нужна помощь?</strong><b aria-hidden="true">→</b></button>
            <button className="button button-secondary" onClick={() => setScreen('home')}>Отменить заказ</button>
          </ScreenFrame>
        )}

        {screen === 'delayed' && (
          <ScreenFrame step="Ожидание машины" onHelp={() => setPanel('help')}>
            <div className="warning-icon" aria-hidden="true">◷</div><p className="eyebrow">МАШИНА ЗАДЕРЖИВАЕТСЯ</p><h1>Нам нужно ещё 5 минут</h1>
            <p className="lead">Предыдущая поездка завершается дольше, чем ожидалось. Мы следим за машиной и сообщим, если время изменится.</p>
            <div className="info-panel compact"><p className="eyebrow">ВАЖНО</p><h2>Плата за ожидание не взимается</h2><p>Можно подождать, связаться с оператором или отменить поездку.</p></div>
            <button className="button button-primary" onClick={() => setScreen('waiting')}>Подождать машину</button>
            <button className="button button-secondary" onClick={() => setPanel('operator')}>Связаться с оператором</button>
            <button className="text-button" onClick={() => setScreen('notArrived')}>Машина так и не приехала</button>
          </ScreenFrame>
        )}

        {screen === 'notArrived' && (
          <ScreenFrame step="Подача машины" onHelp={() => setPanel('help')}>
            <div className="warning-icon" aria-hidden="true">!</div><p className="eyebrow">МАШИНА НЕ ПРИЕХАЛА</p><h1>Найдём решение</h1>
            <p className="lead">С вас ничего не спишется. Оператор уже видит детали заказа и поможет найти машину или оформить новую подачу.</p>
            <div className="info-panel compact"><p className="eyebrow">СТАТУС</p><h2>Подача отменена без комиссии</h2><p>Выберите удобный способ получить помощь.</p></div>
            <button className="button button-primary" onClick={() => setPanel('operator')}>Оператор на связи</button>
            <button className="button button-secondary" onClick={() => { setPanel(null); setScreen('waiting') }}>Заказать другую машину</button>
            <button className="text-button" onClick={() => setPanel('fieldStaff')}>Нужен сотрудник рядом</button>
          </ScreenFrame>
        )}

        {screen === 'offline' && (
          <ScreenFrame step="Подключение" onHelp={() => setPanel('operator')}>
            <div className="offline-icon" aria-hidden="true">⌁</div><p className="eyebrow">НЕТ СОЕДИНЕНИЯ</p><h1>Сохранили всё важное</h1>
            <p className="lead">Последние данные о машине и маршруте останутся на экране. Мы повторим подключение автоматически.</p>
            <div className="connection-status"><span aria-hidden="true">⌁</span><div><strong>Пытаемся восстановить связь</strong><small>Последняя проверка — только что</small></div></div>
            <div className="info-panel compact"><p className="eyebrow">ЕСЛИ НУЖНА ПОМОЩЬ СЕЙЧАС</p><h2>Позвоните оператору</h2><p>Звонок доступен через сотовую сеть, даже если интернет не работает.</p></div>
            <button className="button button-primary" onClick={() => setPanel('operator')}>Позвонить оператору</button>
            <button className="button button-secondary" onClick={() => setScreen('waiting')}>Повторить подключение</button>
          </ScreenFrame>
        )}

        {screen === 'arrival' && (
          <ScreenFrame step="Найдите свою машину" onHelp={() => setPanel('help')}>
            <div className="light-signal" aria-hidden="true"><span></span><span></span><span></span></div>
            <p className="eyebrow">ВАША МАШИНА НА МЕСТЕ</p><h1>{vehicle.colour} {vehicle.model}</h1>
            <div className="vehicle-card"><div className="car-silhouette" aria-hidden="true">▰</div><div><p>{vehicle.model}</p><RussianPlate /></div></div>
            <p className="lead">Проверьте номер и синий световой сигнал на крыше.</p>
            <button className="button button-primary" onClick={() => setScreen('doorOpen')}>Это моя машина</button>
            <button className="text-button" onClick={() => setScreen('wrongCode')}>Не вижу машину</button>
          </ScreenFrame>
        )}

        {screen === 'wrongCode' && (
          <ScreenFrame step="Проверим ещё раз" onHelp={() => setPanel('help')}>
            <div className="warning-icon" aria-hidden="true">!</div><h1>Машина пока не найдена</h1>
            <p className="lead">Проверьте номер и подойдите к точке подачи. Если машины нет рядом, мы поможем.</p>
            <div className="info-panel compact"><p className="eyebrow">ВАША МАШИНА</p><h2>{vehicle.colour} {vehicle.model}</h2><RussianPlate /></div>
            <button className="button button-primary" onClick={() => setScreen('arrival')}>Вернуться к поиску</button>
            <button className="button button-secondary" onClick={() => setPanel('help')}>Связаться с помощью</button>
          </ScreenFrame>
        )}

        {screen === 'doorOpen' && (
          <ScreenFrame step="Посадка" onHelp={() => setPanel('help')}>
            <div className="success-icon" aria-hidden="true">✓</div><p className="eyebrow">ДОСТУП ПОДТВЕРЖДЁН</p><h1>Дверь открыта</h1>
            <p className="lead">Садитесь на заднее сиденье. Багажник откроется по кнопке ниже.</p>
            <button className="button button-secondary">Открыть багажник</button>
            <button className="button button-primary" onClick={() => setScreen('inside')}>Я в салоне</button>
          </ScreenFrame>
        )}

        {screen === 'inside' && (
          <ScreenFrame step="Вы в салоне" onHelp={() => setPanel('help')}>
            <div className="success-icon" aria-hidden="true">✓</div><p className="eyebrow">ВСЁ ГОТОВО</p><h1>Поехали</h1>
            <p className="lead">Перед стартом пристегните ремень. Во время поездки объясним остановки и изменения маршрута заранее.</p>
            <div className="info-panel compact"><p className="eyebrow">МАРШРУТ</p><h2>до {destination}</h2><p>12 минут · {routePrice}</p></div>
            <div className="seatbelt-check"><span aria-hidden="true">✓</span><div><strong>Ремень пристёгнут?</strong><small>Поездка начнётся после подтверждения.</small></div></div>
            <button className="button button-primary" onClick={() => setScreen('trip')}>Ремень пристёгнут, поехали</button>
            <button className="text-button" onClick={() => setPanel('voice')}>Нужна помощь с посадкой</button>
          </ScreenFrame>
        )}

        {screen === 'trip' && (
          <ScreenFrame step="Вы в пути" className="trip-screen" onHelp={() => setPanel('help')}>
            <div className="trip-map route-illustration" aria-hidden="true"><span className="map-dot dot-start"></span><span className="route-line"></span><span className="car-icon">▰</span><span className="map-dot dot-end"></span>
              <div className="map-event"><span>{currentEvent.icon}</span><div><b>{currentEvent.label}</b><small>Машина держит ситуацию под контролем</small></div></div>
            </div>
            <section className="ride-control-panel" aria-live="polite">
              <div className="trip-summary"><div><p className="card-label">В ПУТИ ДО</p><strong>{destination}</strong></div><span>12 мин</span></div>
              <div className="route-points"><div><i></i><span>Текущая позиция</span><small>09:42</small></div><div><i></i><span>{destination}</span><small>09:53</small></div></div>
              <div className="ride-explanation"><div className="motion-icon" aria-hidden="true">{currentEvent.icon}</div><div><p className="eyebrow">{currentEvent.label}</p><h2>{currentEvent.title}</h2><p>{currentEvent.text}</p></div></div>
              <button className="explain-button" onClick={() => setPanel('explanations')}>Почему машина так делает? <span>→</span></button>
              <div className="trip-actions trip-actions-compact">
                <button onClick={() => setPanel('plans')}><span>⌁</span>Маршрут</button>
                <button onClick={() => setPanel('safeStop')}><span>Ⅱ</span>Остановка</button>
                <button onClick={() => setPanel('help')}><span>?</span>Помощь</button>
              </div>
            </section>
            <button className="button button-primary" onClick={() => setScreen('complete')}>Завершить демо</button>
          </ScreenFrame>
        )}

        {screen === 'complete' && (
          <ScreenFrame step="Рейс завершён" className="complete-screen">
            <div className="hero-mark" aria-hidden="true">✓</div><p className="eyebrow">ВЫ НА МЕСТЕ</p><h1>Спасибо за поездку</h1>
            <p className="lead">Перед выходом быстро проверьте, всё ли с вами.</p>
            <div className="leave-checklist"><p className="card-label">ПРОВЕРЬТЕ ПЕРЕД ВЫХОДОМ</p><div><span>✓</span>Телефон и документы</div><div><span>✓</span>Сумка и покупки</div><div><span>✓</span>Багажник</div></div>
            <div className="trip-card final-card"><span>Поездка завершена</span><strong>{routePrice}</strong></div>
            <button className="button button-primary" onClick={() => setPanel('feedback')}>Всё взял(а), готово</button>
            <button className="button button-secondary" onClick={() => setPanel('doorReopened')}>Открыть дверь ещё раз</button>
            <button className="text-button" onClick={() => setPanel('lostItem')}>Я забыл(а) вещь</button>
          </ScreenFrame>
        )}

        {panel === 'trust' && (
          <BottomSheet title="Поддержка без водителя" onClose={() => setPanel(null)}>
            <p className="sheet-lead">До заказа вы знаете, кто поможет в дороге и как быстро можно получить ответ.</p>
            <button className="plan-option" onClick={() => setPanel('voice')}><span>◌</span><div><strong>Голосовой помощник</strong><small>Подскажет в салоне и примет простой запрос голосом</small></div></button>
            <button className="plan-option" onClick={() => setPanel('operator')}><span>◉</span><div><strong>Оператор на связи</strong><small>Подключится в приложении или по телефону</small></div></button>
            <button className="plan-option" onClick={() => setPanel('fieldStaff')}><span>↗</span><div><strong>Сотрудник по звонку</strong><small>Приедет, если ситуацию нельзя решить удалённо</small></div></button>
          </BottomSheet>
        )}

        {panel === 'help' && (
          <BottomSheet title="Чем помочь?" onClose={() => setPanel(null)}>
            <p className="sheet-lead">Сначала выберите ситуацию. Не нужно решать, кому звонить и как объяснять, что произошло.</p>
            <div className="action-menu help-scenarios">
              <button className="action-option" onClick={() => showIssue('unwell')}><span>✚</span><div><strong>Мне плохо</strong><small>Плавно остановимся и подключим человека</small></div><b>→</b></button>
              <button className="action-option" onClick={() => setPanel('explanations')}><span>i</span><div><strong>Что происходит?</strong><small>Объясним действия машины и маршрут</small></div><b>→</b></button>
              <button className="action-option" onClick={() => setPanel('cabin')}><span>!</span><div><strong>Проблема с машиной</strong><small>Дверь, предмет в салоне или другая ситуация</small></div><b>→</b></button>
              <button className="action-option" onClick={() => setPanel('lostItem')}><span>▣</span><div><strong>Я забыл(а) вещь</strong><small>Найдём машину и зарегистрируем заявку</small></div><b>→</b></button>
              <button className="action-option" onClick={() => { setPanel(null); setScreen('arrival') }}><span>⌕</span><div><strong>Не могу найти машину</strong><small>Ещё раз покажем номер и сигнал</small></div><b>→</b></button>
            </div>
            <button className="support-option direct-operator" onClick={() => setPanel('operator')}><span>Нужен оператор прямо сейчас</span><b>→</b></button>
          </BottomSheet>
        )}

        {panel === 'deliveryHelp' && (
          <BottomSheet title="Помощь с подачей" onClose={() => setPanel(null)}>
            <p className="sheet-lead">Выберите, что произошло. Мы уже знаем адрес подачи и данные автомобиля.</p>
            <div className="action-menu">
              <button className="action-option" onClick={() => { setPanel(null); setScreen('delayed') }}><span>◷</span><div><strong>Машина задерживается</strong><small>Покажем новое время и варианты</small></div><b>→</b></button>
              <button className="action-option" onClick={() => { setPanel(null); setScreen('notArrived') }}><span>!</span><div><strong>Машина не приехала</strong><small>Найдём решение без комиссии</small></div><b>→</b></button>
              <button className="action-option" onClick={() => { setPanel(null); setScreen('offline') }}><span>⌁</span><div><strong>Нет соединения</strong><small>Сохраним маршрут и подскажем, что делать</small></div><b>→</b></button>
              <button className="action-option" onClick={() => setPanel('operator')}><span>◉</span><div><strong>Оператор на связи</strong><small>Подключим человека прямо сейчас</small></div><b>→</b></button>
            </div>
          </BottomSheet>
        )}

        {panel === 'lostItem' && (
          <BottomSheet title="Вернём забытую вещь" onClose={() => setPanel(null)}>
            <div className="lost-ride"><span aria-hidden="true">✓</span><div><strong>Последняя поездка</strong><small>Белый Hyundai Sonata · А 328 МР · сегодня</small></div></div>
            <p className="sheet-lead">Что вы оставили в салоне? Передадим заявку в поддержку и проверим машину.</p>
            <div className="action-menu">
              <button className="action-option" onClick={() => { setLostItem('Телефон или документы'); setPanel('lostItemSent') }}><span>◌</span><div><strong>Телефон или документы</strong><small>Поможем вернуть в первую очередь</small></div><b>→</b></button>
              <button className="action-option" onClick={() => { setLostItem('Сумка или рюкзак'); setPanel('lostItemSent') }}><span>▣</span><div><strong>Сумка или рюкзак</strong><small>Проверим салон и багажник</small></div><b>→</b></button>
              <button className="action-option" onClick={() => { setLostItem('Другая вещь'); setPanel('lostItemSent') }}><span>·</span><div><strong>Другая вещь</strong><small>Опишете её оператору</small></div><b>→</b></button>
            </div>
          </BottomSheet>
        )}

        {panel === 'lostItemSent' && (
          <BottomSheet title="Заявка принята" onClose={() => setPanel(null)}>
            <div className="confirmation-icon" aria-hidden="true">✓</div>
            <p className="sheet-lead">Ищем: <strong>{lostItem}</strong>. Проверим автомобиль и свяжемся с вами, как только вещь найдётся.</p>
            <div className="lost-status"><span>◉</span><div><strong>Поддержка уже получила заявку</strong><small>Номер рейса и данные автомобиля добавлены автоматически</small></div></div>
            <button className="button button-primary sheet-button" onClick={() => setPanel('operator')}>Связаться с оператором</button>
          </BottomSheet>
        )}

        {panel === 'voice' && (
          <BottomSheet title="Голосовой помощник" onClose={() => setPanel(null)}>
            <p className="sheet-lead">Доступен в приложении и на экране в салоне. Можно сказать: «Мне плохо», «Где машина?» или «Мне нужна остановка».</p>
            {voiceActive && <div className="voice-state"><span>◉</span><div><strong>Слушаю вас</strong><small>Голосовой запрос распознан. При сложной ситуации подключим оператора.</small></div></div>}
            <button className="button button-primary sheet-button" onClick={() => setVoiceActive(true)}>{voiceActive ? 'Помощник слушает' : 'Начать голосовой запрос'}</button>
          </BottomSheet>
        )}

        {panel === 'operator' && (
          <BottomSheet title="Оператор на связи" onClose={() => setPanel(null)}>
            <div className="operator-card"><span aria-hidden="true">А</span><div><strong>{operatorConnected ? 'Арина, оператор поддержки' : 'Подключаем оператора'}</strong><small>{operatorConnected ? 'Видит детали вашей поездки и остаётся на линии' : 'Обычно отвечаем меньше чем за 30 секунд'}</small></div></div>
            <p className="sheet-lead">Оператор получает статус машины и вашу точку подачи, поэтому не нужно повторять данные заказа.</p>
            <button className="button button-primary sheet-button" onClick={() => setOperatorConnected(true)}>{operatorConnected ? 'Оператор уже на связи' : 'Подключиться к оператору'}</button>
            {operatorConnected && <button className="button button-secondary" onClick={() => setPanel('fieldStaff')}>Запросить сотрудника</button>}
          </BottomSheet>
        )}

        {panel === 'fieldStaff' && (
          <BottomSheet title="Сотрудник по звонку" onClose={() => setPanel(null)}>
            <div className="operator-card"><span aria-hidden="true">↗</span><div><strong>{fieldStaffRequested ? 'Сотрудник выехал' : 'Помощь на месте'}</strong><small>{fieldStaffRequested ? 'Будет у точки подачи примерно через 7 минут' : 'Оператор запросит сотрудника, если удалённой помощи недостаточно'}</small></div></div>
            <p className="sheet-lead">Сотрудник поможет с посадкой, багажом или ситуацией у автомобиля. Он не управляет машиной, а остаётся рядом с вами.</p>
            <button className="button button-primary sheet-button" onClick={() => setFieldStaffRequested(true)}>{fieldStaffRequested ? 'Сотрудник уже в пути' : 'Запросить сотрудника'}</button>
          </BottomSheet>
        )}

        {panel === 'explanations' && (
          <BottomSheet title="Машина объясняет действия" onClose={() => setPanel(null)}>
            <p className="sheet-lead">Она сообщает о манёвре заранее: вам не нужно гадать, что происходит.</p>
            {(Object.keys(driveEvents) as DriveEvent[]).map((event) => (
              <button className="event-option" key={event} onClick={() => chooseEvent(event)}>
                <span>{driveEvents[event].icon}</span><div><strong>{driveEvents[event].title}</strong><small>{driveEvents[event].reassurance}</small></div><b>→</b>
              </button>
            ))}
          </BottomSheet>
        )}

        {panel === 'plans' && (
          <BottomSheet title="Изменить планы" onClose={() => setPanel(null)}>
            <p className="sheet-lead">Вы управляете планом поездки так же просто, как в обычном такси.</p>
            <button className="plan-option" onClick={() => { setDestination('Страстной бульвар, 8'); setRoutePrice('510 ₽'); setPanel('routeChanged') }}>
              <span>↗</span><div><strong>Изменить пункт назначения</strong><small>Построим новый маршрут и покажем цену</small></div>
            </button>
            <button className="plan-option" onClick={() => setPanel('safeStop')}>
              <span>Ⅱ</span><div><strong>Остановиться раньше</strong><small>Найдём ближайшее безопасное место</small></div>
            </button>
          </BottomSheet>
        )}

        {panel === 'routeChanged' && (
          <BottomSheet title="Маршрут изменён" onClose={() => setPanel(null)}>
            <div className="confirmation-icon" aria-hidden="true">✓</div>
            <p className="sheet-lead">Едем до <strong>{destination}</strong>. Поездка займёт 16 минут, итоговая цена — {routePrice}.</p>
            <button className="button button-primary sheet-button" onClick={() => setPanel(null)}>Понятно</button>
          </BottomSheet>
        )}

        {panel === 'safeStop' && (
          <BottomSheet title="Где остановиться?" onClose={() => setPanel(null)}>
            <p className="sheet-lead">Выберите ближайшую разрешённую точку. Машина не остановится в опасном месте.</p>
            <div className="action-menu safe-stop-list">
              {safeStopOptions.map((stop) => <button className="action-option" key={stop.name} onClick={() => { setSelectedSafeStop(stop); setPanel('safeStopConfirmed') }}><span>Ⅱ</span><div><strong>{stop.name}</strong><small>{stop.details} · {stop.note}</small></div><b>→</b></button>)}
            </div>
          </BottomSheet>
        )}

        {panel === 'safeStopConfirmed' && (
          <BottomSheet title="Остановка подтверждена" onClose={() => setPanel(null)}>
            <div className="confirmation-icon" aria-hidden="true">✓</div>
            <p className="sheet-lead">Едем к точке <strong>{selectedSafeStop.name}</strong>. Остановимся через {selectedSafeStop.details.split(' · ')[0]} в разрешённой зоне.</p>
            <button className="button button-primary sheet-button" onClick={() => setPanel(null)}>Остановиться через {selectedSafeStop.details.split(' · ')[0]}</button>
          </BottomSheet>
        )}

        {panel === 'doorReopened' && (
          <BottomSheet title="Дверь открыта ещё раз" onClose={() => setPanel(null)}>
            <div className="confirmation-icon" aria-hidden="true">✓</div>
            <p className="sheet-lead">Дверь будет открыта 30 секунд. Заберите вещь и нажмите «Готово», когда будете готовы.</p>
            <button className="button button-primary sheet-button" onClick={() => setPanel(null)}>Готово</button>
          </BottomSheet>
        )}

        {panel === 'feedback' && (
          <BottomSheet title={feedback ? 'Спасибо за ответ' : 'Как прошла поездка?'} onClose={() => { setFeedback(null); setPanel(null) }}>
            {feedback ? <><div className="confirmation-icon" aria-hidden="true">✓</div><p className="sheet-lead">{feedback === 'clear' ? 'Отлично — рады, что действия машины были понятными.' : 'Спасибо. Это поможет сделать объяснения машины спокойнее и понятнее.'}</p><button className="button button-primary sheet-button" onClick={reset}>Завершить</button></> : <><p className="sheet-lead">Был ли момент, когда было непонятно, что делает машина?</p><button className="plan-option feedback-option" onClick={() => setFeedback('clear')}><span>✓</span><div><strong>Нет, всё было понятно</strong><small>Спасибо, что доверили нам поездку</small></div></button><button className="plan-option feedback-option" onClick={() => setFeedback('unclear')}><span>?</span><div><strong>Да, был непонятный момент</strong><small>Учтём это в следующих объяснениях</small></div></button></>}
          </BottomSheet>
        )}

        {panel === 'cabin' && (
          <BottomSheet title="Ситуация в салоне" onClose={() => setPanel(null)}>
            <p className="sheet-lead">Выберите ситуацию — автомобиль и поддержка сразу подскажут следующий безопасный шаг.</p>
            {(Object.keys(cabinIssues) as CabinIssue[]).map((issue) => (
              <button className="plan-option" key={issue} onClick={() => showIssue(issue)}>
                <span>{cabinIssues[issue].icon}</span><div><strong>{cabinIssues[issue].title}</strong><small>{cabinIssues[issue].action}</small></div>
              </button>
            ))}
          </BottomSheet>
        )}

        {panel === 'incidentResult' && (
          <BottomSheet title={currentIssue.title} onClose={() => setPanel(null)}>
            <div className="issue-icon" aria-hidden="true">{currentIssue.icon}</div>
            <p className="sheet-lead">{currentIssue.text}</p>
            <button className="button button-primary sheet-button" onClick={() => setPanel('help')}>{currentIssue.action}</button>
          </BottomSheet>
        )}
      </section>
    </main>
  )
}

function ScreenFrame({ children, step, onHelp, className = '' }: { children: ReactNode; step: string; onHelp?: () => void; className?: string }) {
  return <div className={`screen ${className}`}><div className="screen-topline"><span>{step}</span>{onHelp && <button className="help-link" onClick={onHelp}>Помощь</button>}</div><div className="screen-content">{children}</div></div>
}

function BottomSheet({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return <div className="help-sheet" role="dialog" aria-modal="true" aria-label={title}><div className="sheet-grab" aria-hidden="true"></div><button className="close-button" onClick={onClose} aria-label="Закрыть">×</button><p className="eyebrow">ПОМОЩНИК В ПОЕЗДКЕ</p><h2>{title}</h2>{children}</div>
}

function TrustItem({ icon, text }: { icon: string; text: string }) {
  return <div className="trust-item"><span>{icon}</span><p>{text}</p></div>
}

function RussianPlate() {
  return <div className="russian-plate" aria-label={`Номер ${vehicle.plate}, регион ${vehicle.region}`}><span>{vehicle.plate}</span><b>{vehicle.region}</b><small>RUS</small></div>
}

export default App
