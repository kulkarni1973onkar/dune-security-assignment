// In-memory pub/sub to notify subscribers of real-time form response updates.

package handlers

import (
	"sync"
)

var (
	rtMu sync.Mutex
	// key = formId hex; value
	rtSubs = map[string]map[chan struct{}]struct{}{}
)

func rtSubscribe(formID string) (ch chan struct{}, unsubscribe func()) {
	ch = make(chan struct{}, 1)

	rtMu.Lock()
	if _, ok := rtSubs[formID]; !ok {
		rtSubs[formID] = make(map[chan struct{}]struct{})
	}
	rtSubs[formID][ch] = struct{}{}
	rtMu.Unlock()

	unsubscribe = func() {
		rtMu.Lock()
		if set, ok := rtSubs[formID]; ok {
			delete(set, ch)
			if len(set) == 0 {
				delete(rtSubs, formID)
			}
		}
		rtMu.Unlock()
		close(ch)
	}
	return ch, unsubscribe
}

func rtNotify(formID string) {
	rtMu.Lock()
	subs := rtSubs[formID]
	// fan-out non-blocking
	for ch := range subs {
		select {
		case ch <- struct{}{}:
		default:
		}
	}
	rtMu.Unlock()
}
