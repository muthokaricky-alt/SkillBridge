import { useEffect, useRef, useState } from "react";
import { api } from "./api.js";
import { calcMatch, getAvatarColor } from "./utils.js";

import Nav from "./components/Nav.jsx";
import Toast from "./components/Toast.jsx";
import RequestModal from "./components/modals/RequestModal.jsx";
import SessionModal from "./components/modals/SessionModal.jsx";
import ReviewModal from "./components/modals/ReviewModal.jsx";

import DiscoverPage from "./pages/DiscoverPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RequestsPage from "./pages/RequestsPage.jsx";
import SchedulePage from "./pages/SchedulePage.jsx";

export default function App() {
  /* ---------- global / cross-page state ---------- */
  const [page, setPage] = useState("discover");

  // Data that used to be hardcoded now starts empty and gets filled in by
  // the initial fetch below — see the "load everything" useEffect.
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [myWants, setMyWants] = useState([]);
  const [myCoins, setMyCoins] = useState(0);
  const [coinHistory, setCoinHistory] = useState([]);
  const [sentSet, setSentSet] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const nextId = useRef(100);

  const [toast, setToast] = useState({ show: false, msg: "", type: "" });
  const toastTimer = useRef(null);

  function showToast(msg, type = "") {
    clearTimeout(toastTimer.current);
    setToast({ show: true, msg, type });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2800);
  }

  // Applies a profile object returned by the API (offers/wants/coins/history)
  // to local state in one go, instead of four separate setters everywhere.
  function applyProfile(p) {
    setMyOffers(p.offers);
    setMyWants(p.wants);
    setMyCoins(p.coins);
    setCoinHistory(p.coinHistory);
  }

  // ---------- load everything from the API on first render ----------
  useEffect(() => {
    async function loadAll() {
      try {
        const [usersData, requestsData, sessionsData, profileData] = await Promise.all([
          api.getUsers(),
          api.getRequests(),
          api.getSessions(),
          api.getProfile(),
        ]);
        setUsers(usersData);
        setRequests(requestsData);
        setSessions(sessionsData);
        applyProfile(profileData);
        // rebuild "already sent" state from any request with status "sent"
        setSentSet(new Set(requestsData.filter((r) => r.status === "sent").map((r) => r.fromId)));
        if (usersData.length) setSessWith(usersData[0].name);
      } catch (err) {
        setLoadError("Couldn't reach the SkillBridge API. Is the backend running? (npm run server)");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  function nav(p) { setPage(p); }

  /* ---------- discover: search / filter / request modal ---------- */
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [reqModalUser, setReqModalUser] = useState(null);
  const [exchangeType, setExchangeTypeState] = useState("swap");
  const [reqOfferSel, setReqOfferSel] = useState("");
  const [reqWantSel, setReqWantSel] = useState("");
  const [reqCoinWantSel, setReqCoinWantSel] = useState("");
  const [reqMsg, setReqMsg] = useState("");

  function setTag(tag) { setActiveTag((t) => (t === tag ? "" : tag)); }

  function openReqModal(user) {
    if (!user || sentSet.has(user.id)) return;
    setReqModalUser(user);
    setExchangeTypeState("swap");
    setReqOfferSel(myOffers[0] || "");
    setReqWantSel(user.offers[0] || "");
    setReqCoinWantSel(user.offers[0] || "");
    setReqMsg("");
    setReqModalOpen(true);
  }
  function closeReqModal() { setReqModalOpen(false); setReqModalUser(null); }

  async function sendRequest() {
    if (!reqModalUser) return;
    const msg = reqMsg.trim();
    if (!msg) { showToast("Please add a message", "error"); return; }

    const offer = exchangeType === "swap" ? reqOfferSel : null;
    const want = exchangeType === "swap" ? reqWantSel : reqCoinWantSel;

    try {
      if (exchangeType === "coin") {
        if (myCoins < 3) { showToast("Not enough Skill Coins!", "error"); return; }
        const updatedProfile = await api.adjustCoins(-3, `Requested skill: ${want} from ${reqModalUser.name}`);
        applyProfile(updatedProfile);
        showToast("3 Skill Coins spent · Request sent ✓", "success");
      } else {
        showToast(`Request sent to ${reqModalUser.name} ✓`, "success");
      }

      const newRequest = await api.createRequest({
        fromId: reqModalUser.id, toId: reqModalUser.id, offer, want, type: exchangeType, msg,
      });
      setRequests((rs) => [...rs, newRequest]);
      setSentSet((s) => new Set(s).add(reqModalUser.id));
      closeReqModal();
    } catch (err) {
      showToast("Couldn't send that request — try again", "error");
    }
  }

  /* ---------- profile: add/remove skills ---------- */
  async function addSkill(type, value) {
    const v = value.trim();
    if (!v) return;
    const arr = type === "offer" ? myOffers : myWants;
    if (arr.some((s) => s.toLowerCase() === v.toLowerCase())) {
      showToast("Already in your list");
      return;
    }
    try {
      const updatedProfile = await api.addProfileSkill(type, v);
      applyProfile(updatedProfile);
      showToast(type === "offer" ? `${v} added · +1 Skill Coin ◈` : `${v} added ✓`, "success");
    } catch (err) {
      showToast("Couldn't add that skill", "error");
    }
  }

  async function removeSkill(type, index) {
    const arr = type === "offer" ? myOffers : myWants;
    const removed = arr[index];
    try {
      const updatedProfile = await api.removeProfileSkill(type, removed);
      applyProfile(updatedProfile);
      showToast(`${removed} removed`);
    } catch (err) {
      showToast("Couldn't remove that skill", "error");
    }
  }

  /* ---------- requests page ---------- */
  const [activeReqTab, setActiveReqTab] = useState("incoming");
  const [decliningId, setDecliningId] = useState(null);

  async function acceptReq(id) {
    const req = requests.find((r) => r.id === id);
    const partnerName = users.find((u) => u.id === (req?.fromId || req?.toId))?.name || "User";
    try {
      const updated = await api.updateRequestStatus(id, "accepted");
      setRequests((rs) => rs.map((r) => (r.id === id ? updated : r)));
      const updatedProfile = await api.adjustCoins(2, `Accepted swap request from ${partnerName}`);
      applyProfile(updatedProfile);
      showToast("Exchange accepted! +2 Skill Coins ◈", "success");
    } catch (err) {
      showToast("Couldn't accept that request", "error");
    }
  }

  function declineReq(id) {
    setDecliningId(id);
    // matches the fade so the card doesn't just vanish
    setTimeout(async () => {
      try {
        await api.deleteRequest(id);
        setRequests((rs) => rs.filter((r) => r.id !== id));
      } catch (err) {
        showToast("Couldn't decline that request", "error");
      } finally {
        setDecliningId(null);
      }
    }, 400);
  }

  const incomingCount = requests.filter((r) => r.status === "incoming").length;

  /* ---------- schedule page ---------- */
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(5); // 0-indexed: 5 = June
  const [selectedDate, setSelectedDate] = useState(null);

  function changeMonth(direction) {
    const d = new Date(calYear, calMonth + direction, 1);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
  }
  function selectDay(d) { setSelectedDate({ d, m: calMonth, y: calYear }); }

  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessWith, setSessWith] = useState(""); // filled in once users load, see loadAll()
  const [sessSkill, setSessSkill] = useState("");
  const [sessDate, setSessDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessTime, setSessTime] = useState("");
  const [sessDur, setSessDur] = useState(60);

  async function bookSession() {
    const skill = sessSkill.trim();
    if (!skill || !sessDate || !sessTime) { showToast("Please fill in all fields", "error"); return; }
    try {
      const newSession = await api.createSession({
        with: sessWith, skill, date: sessDate, time: sessTime, dur: sessDur, color: getAvatarColor(sessWith),
      });
      setSessions((s) => [...s, newSession]);
      setSessionModalOpen(false);
      showToast(`Session booked with ${sessWith} ✓`, "success");
    } catch (err) {
      showToast("Couldn't book that session", "error");
    }
  }

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState(null);
  const [reviewStar, setReviewStar] = useState(0);

  function openReview(sessionId) {
    setReviewSessionId(sessionId);
    setReviewStar(0);
    setReviewModalOpen(true);
  }

  async function submitReview() {
    if (!reviewStar) { showToast("Please select a rating", "error"); return; }
    const sess = sessions.find((s) => s.id === reviewSessionId);
    try {
      const updated = await api.markSessionReviewed(reviewSessionId);
      setSessions((ss) => ss.map((s) => (s.id === reviewSessionId ? updated : s)));
      const updatedProfile = await api.adjustCoins(1, `Reviewed session with ${sess?.with || "partner"}`);
      applyProfile(updatedProfile);
      setReviewModalOpen(false);
      showToast("Review submitted · +1 Skill Coin ◈", "success");
    } catch (err) {
      showToast("Couldn't submit that review", "error");
    }
  }

  const reviewSession = sessions.find((s) => s.id === reviewSessionId);

  /* ---------- discover: filtered/sorted list ---------- */
  let discoverList = [...users];
  if (activeTag) {
    discoverList = discoverList.filter((u) =>
      [...u.offers, ...u.wants].some((s) => s.toLowerCase().includes(activeTag.toLowerCase()))
    );
  }
  if (search) {
    const q = search.toLowerCase();
    discoverList = discoverList.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.dept.toLowerCase().includes(q) ||
      [...u.offers, ...u.wants].some((s) => s.toLowerCase().includes(q))
    );
  }
  discoverList.sort((a, b) => calcMatch(b, myOffers, myWants) - calcMatch(a, myOffers, myWants));

  if (loading) {
    return (
      <div className="bg-white text-[#111111] min-h-screen flex items-center justify-center">
        <div className="text-sm text-[#999]">Loading SkillBridge…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white text-[#111111] min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="text-2xl mb-3">⚠️</div>
          <div className="font-semibold mb-1">Can't connect to the API</div>
          <p className="text-sm text-[#666]">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#111111] min-h-screen">
      <Nav page={page} nav={nav} search={search} setSearch={setSearch} myCoins={myCoins} incomingCount={incomingCount} />

      {page === "discover" && (
        <DiscoverPage
          list={discoverList}
          myOffers={myOffers} myWants={myWants}
          activeTag={activeTag} setTag={setTag}
          sentSet={sentSet} onRequest={openReqModal}
        />
      )}
      {page === "profile" && (
        <ProfilePage
          myOffers={myOffers} myWants={myWants} myCoins={myCoins} sessionsCount={sessions.length}
          coinHistory={coinHistory}
          onAddSkill={addSkill} onRemoveSkill={removeSkill} nav={nav}
        />
      )}
      {page === "requests" && (
        <RequestsPage
          requests={requests} users={users} activeReqTab={activeReqTab} setActiveReqTab={setActiveReqTab}
          incomingCount={incomingCount} onAccept={acceptReq} onDecline={declineReq} decliningId={decliningId}
        />
      )}
      {page === "schedule" && (
        <SchedulePage
          calYear={calYear} calMonth={calMonth} selectedDate={selectedDate}
          sessions={sessions} onChangeMonth={changeMonth} onSelectDay={selectDay}
          onOpenSessionModal={() => setSessionModalOpen(true)} onOpenReview={openReview}
        />
      )}

      <RequestModal
        open={reqModalOpen} user={reqModalUser} myOffers={myOffers}
        exchangeType={exchangeType} setExchangeType={setExchangeTypeState}
        offerSel={reqOfferSel} setOfferSel={setReqOfferSel}
        wantSel={reqWantSel} setWantSel={setReqWantSel}
        coinWantSel={reqCoinWantSel} setCoinWantSel={setReqCoinWantSel}
        msg={reqMsg} setMsg={setReqMsg}
        myCoins={myCoins} onClose={closeReqModal} onSend={sendRequest}
      />

      <SessionModal
        open={sessionModalOpen} onClose={() => setSessionModalOpen(false)}
        users={users}
        withUser={sessWith} setWithUser={setSessWith}
        skill={sessSkill} setSkill={setSessSkill}
        date={sessDate} setDate={setSessDate}
        time={sessTime} setTime={setSessTime}
        dur={sessDur} setDur={setSessDur}
        onBook={bookSession}
      />

      <ReviewModal
        open={reviewModalOpen} onClose={() => setReviewModalOpen(false)}
        session={reviewSession} star={reviewStar} setStar={setReviewStar}
        onSubmit={submitReview}
      />

      <Toast show={toast.show} msg={toast.msg} type={toast.type} />
    </div>
  );
}
