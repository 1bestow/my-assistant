// 数据存储
const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// 当前选中的图标
let selectedIcon = '⭐';
let currentWorkout = [];
let restTimerInterval = null;

// 鼓励语列表
const encouragements = [
    { emoji: '🎉', text: '太棒了！', subtext: '继续保持这个好习惯' },
    { emoji: '🔥', text: '真厉害！', subtext: '你正在变得更好' },
    { emoji: '💪', text: '加油！', subtext: '坚持就是胜利' },
    { emoji: '✨', text: '优秀！', subtext: '今天也是充实的一天' },
    { emoji: '🌟', text: '赞！', subtext: '你离目标又近了一步' },
    { emoji: '🚀', text: '起飞！', subtext: '你的努力值得被看见' }
];

// 动作详解数据
const exerciseDetails = {
    '深蹲': '双脚与肩同宽，脚尖微外展。下蹲时膝盖与脚尖方向一致，大腿至少与地面平行。保持背部挺直，核心收紧。',
    '硬拉': '双脚与髋同宽，杠铃贴近小腿。保持背部挺直，臀部向后推，用腿部力量拉起杠铃。顶峰时收紧臀部。',
    '卧推': '躺在卧推凳上，双脚踩实地面。握距略宽于肩，下放时肘部呈45度角，触胸后推起。',
    '推举': '站立或坐姿，杠铃置于锁骨处。垂直向上推起，保持核心稳定，避免过度后仰。',
    '引体向上': '正握或反握单杠，握距略宽于肩。拉起时胸部靠近单杠，控制速度下放至手臂伸直。',
    '划船': '俯身约45度，保持背部挺直。将重量拉向腹部，收缩背部肌肉，控制下放。',
    '弯举': '站立，大臂贴紧身体两侧。弯曲手肘将重量举起，顶峰收缩肱二头肌，缓慢下放。',
    '臂屈伸': '双手撑在双杠或椅子边缘，身体下降时肘部向后弯曲。推起时手臂伸直但不要锁死肘关节。'
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    renderHabits();
    renderWorkouts();
    renderIdeas();
    renderVideos();
    updateStats();
});

// 更新日期
function updateDate() {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('currentDate').textContent = date.toLocaleDateString('zh-CN', options);
}

// 页面切换
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`page-${page}`).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // 更新FAB按钮功能
    const fab = document.getElementById('fabBtn');
    fab.onclick = () => {
        if (page === 'habits') showAddHabitModal();
        else if (page === 'workout') showAddWorkoutModal();
    };
    fab.style.display = (page === 'ideas' || page === 'videos') ? 'none' : 'flex';
}

// ========== 习惯打卡 ==========

function renderHabits() {
    const habits = Storage.get('habits');
    const container = document.getElementById('habitsList');
    const today = new Date().toDateString();
    
    if (habits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 16px;">📝</div>
                <div>还没有习惯</div>
                <div style="font-size: 14px; margin-top: 8px;">点击右下角添加第一个习惯</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = habits.map(habit => {
        const isCompleted = habit.completedDates?.includes(today);
        const streak = calculateStreak(habit);
        return `
            <div class="glass-card habit-item ${isCompleted ? 'completed' : ''}" onclick="toggleHabit('${habit.id}')">
                <div class="habit-icon">${habit.icon}</div>
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-meta">
                        <span>🔥 ${streak}天</span>
                        <span>完成率 ${habit.completedDates?.length || 0}次</span>
                    </div>
                </div>
                <div class="habit-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <path d="M5 12l5 5L20 7"/>
                    </svg>
                </div>
            </div>
        `;
    }).join('');
    
    updateHabitStats();
}

function calculateStreak(habit) {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const dates = habit.completedDates.map(d => new Date(d).getTime()).sort((a, b) => b - a);
    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;
    
    if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
            if (dates[i-1] - dates[i] === 86400000) {
                streak++;
            } else {
                break;
            }
        }
    }
    return streak;
}

function toggleHabit(id) {
    const habits = Storage.get('habits');
    const habit = habits.find(h => h.id === id);
    const today = new Date().toDateString();
    
    if (!habit.completedDates) habit.completedDates = [];
    
    const index = habit.completedDates.indexOf(today);
    if (index > -1) {
        habit.completedDates.splice(index, 1);
    } else {
        habit.completedDates.push(today);
        showEncouragement();
    }
    
    Storage.set('habits', habits);
    renderHabits();
}

function showEncouragement() {
    const modal = document.getElementById('encouragementModal');
    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    document.getElementById('encouragementEmoji').textContent = msg.emoji;
    document.getElementById('encouragementText').textContent = msg.text;
    document.getElementById('encouragementSubtext').textContent = msg.subtext;
    
    modal.classList.add('show');
}

function hideEncouragementModal() {
    document.getElementById('encouragementModal').classList.remove('show');
}

function showAddHabitModal() {
    document.getElementById('addHabitModal').classList.add('show');
    document.getElementById('habitNameInput').value = '';
    selectedIcon = '⭐';
}

function selectIcon(icon) {
    selectedIcon = icon;
}

function addHabit() {
    const name = document.getElementById('habitNameInput').value.trim();
    if (!name) return;
    
    const habits = Storage.get('habits');
    habits.push({
        id: Date.now().toString(),
        name,
        icon: selectedIcon,
        completedDates: [],
        createdAt: new Date().toISOString()
    });
    
    Storage.set('habits', habits);
    hideModal('addHabitModal');
    renderHabits();
}

function updateHabitStats() {
    const habits = Storage.get('habits');
    const today = new Date().toDateString();
    const completed = habits.filter(h => h.completedDates?.includes(today)).length;
    const totalStreak = habits.reduce((sum, h) => sum + calculateStreak(h), 0);
    
    document.getElementById('habitCompleted').textContent = completed;
    document.getElementById('habitTotal').textContent = habits.length;
    document.getElementById('habitStreak').textContent = totalStreak;
}

// ========== 训练记录 ==========

function renderWorkouts() {
    const workouts = Storage.get('workouts');
    const container = document.getElementById('workoutsList');
    
    if (workouts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 16px;">💪</div>
                <div>还没有训练记录</div>
                <div style="font-size: 14px; margin-top: 8px;">点击右下角开始训练</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = workouts.slice().reverse().map(workout => {
        const date = new Date(workout.date);
        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalVolume = workout.exercises.reduce((sum, ex) => 
            sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0);
        
        return `
            <div class="glass-card list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${date.toLocaleDateString('zh-CN')} · ${workout.exercises.length}个动作</div>
                    <div class="list-item-subtitle">${totalSets}组 · ${totalVolume.toFixed(0)}kg</div>
                </div>
                <div class="delete-btn" onclick="deleteWorkout('${workout.id}', event)">🗑️</div>
            </div>
        `;
    }).join('');
    
    updateWorkoutStats();
}

function showAddWorkoutModal() {
    currentWorkout = [];
    document.getElementById('workoutExercises').innerHTML = '';
    document.getElementById('addWorkoutModal').classList.add('show');
}

function addExercise(name) {
    const exercise = { name, sets: [], lastSetTime: null };
    currentWorkout.push(exercise);
    renderWorkoutExercises();
    
    // 开始组间休息计时
    startRestTimer();
}

function startRestTimer() {
    // 清除之前的计时器
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }
    
    const banner = document.getElementById('restTimerBanner');
    const display = document.getElementById('restTimerDisplay');
    banner.classList.add('show');
    
    let seconds = 0;
    restTimerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        display.textContent = `${mins}:${secs}`;
    }, 1000);
}

function stopRestTimer() {
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
        restTimerInterval = null;
    }
    document.getElementById('restTimerBanner').classList.remove('show');
}

function renderWorkoutExercises() {
    const container = document.getElementById('workoutExercises');
    
    container.innerHTML = currentWorkout.map((ex, idx) => `
        <div class="glass-card" style="padding: 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-weight: 600;">${ex.name}</div>
                <div style="display: flex; gap: 8px;">
                    <button class="glass-button secondary" onclick="toggleExerciseDetail(${idx})" style="padding: 6px 12px; font-size: 12px;">📖 详解</button>
                    <button class="glass-button secondary" onclick="addSet(${idx})" style="padding: 6px 12px; font-size: 12px;">+ 组</button>
                </div>
            </div>
            <div class="exercise-detail" id="detail-${idx}">
                <div class="exercise-detail-content">
                    ${exerciseDetails[ex.name] || '暂无该动作的详细说明'}
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${ex.sets.map((set, sidx) => `
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="color: var(--text-secondary); font-size: 14px;">第${sidx + 1}组</span>
                        <input type="number" class="glass-input" style="flex: 1; padding: 8px 12px;" 
                            placeholder="重量(kg)" value="${set.weight || ''}" 
                            onchange="updateSet(${idx}, ${sidx}, 'weight', this.value)">
                        <input type="number" class="glass-input" style="flex: 1; padding: 8px 12px;" 
                            placeholder="次数" value="${set.reps || ''}" 
                            onchange="updateSet(${idx}, ${sidx}, 'reps', this.value)">
                        <span class="delete-btn" onclick="removeSet(${idx}, ${sidx})">✕</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function toggleExerciseDetail(idx) {
    const detail = document.getElementById(`detail-${idx}`);
    detail.classList.toggle('show');
}

function addSet(exerciseIdx) {
    currentWorkout[exerciseIdx].sets.push({ weight: '', reps: '' });
    renderWorkoutExercises();
    stopRestTimer();
    startRestTimer();
}

function updateSet(exerciseIdx, setIdx, field, value) {
    currentWorkout[exerciseIdx].sets[setIdx][field] = parseFloat(value) || 0;
}

function removeSet(exerciseIdx, setIdx) {
    currentWorkout[exerciseIdx].sets.splice(setIdx, 1);
    renderWorkoutExercises();
}

function saveWorkout() {
    if (currentWorkout.length === 0) {
        alert('请至少添加一个动作');
        return;
    }
    
    const workouts = Storage.get('workouts');
    workouts.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        exercises: currentWorkout
    });
    
    Storage.set('workouts', workouts);
    stopRestTimer();
    hideModal('addWorkoutModal');
    renderWorkouts();
}

function deleteWorkout(id, event) {
    event.stopPropagation();
    const workouts = Storage.get('workouts').filter(w => w.id !== id);
    Storage.set('workouts', workouts);
    renderWorkouts();
}

function updateWorkoutStats() {
    const workouts = Storage.get('workouts');
    const now = new Date();
    const weekStart = new Date(now - now.getDay() * 86400000);
    
    const weekWorkouts = workouts.filter(w => new Date(w.date) >= weekStart);
    const totalSets = workouts.reduce((sum, w) => 
        sum + w.exercises.reduce((s, ex) => s + ex.sets.length, 0), 0);
    const totalVolume = workouts.reduce((sum, w) => 
        sum + w.exercises.reduce((s, ex) => 
            s + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0), 0);
    
    document.getElementById('workoutCount').textContent = weekWorkouts.length;
    document.getElementById('totalVolume').textContent = totalVolume.toFixed(0);
    document.getElementById('totalSets').textContent = totalSets;
}

// ========== 灵感捕捉 ==========

function renderIdeas() {
    const ideas = Storage.get('ideas');
    const container = document.getElementById('ideasList');
    
    if (ideas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 16px;">💡</div>
                <div>还没有记录灵感</div>
                <div style="font-size: 14px; margin-top: 8px;">在上方快速记录你的想法</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ideas.slice().reverse().map(idea => `
        <div class="glass-card list-item">
            <div class="checkbox ${idea.completed ? 'checked' : ''}" onclick="toggleIdeaComplete('${idea.id}')">
                ${idea.completed ? '✓' : ''}
            </div>
            <div class="list-item-content">
                <div class="list-item-title" style="${idea.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${idea.content}</div>
                <div class="list-item-subtitle">${new Date(idea.createdAt).toLocaleString('zh-CN')}</div>
            </div>
            <div class="delete-btn" onclick="deleteIdea('${idea.id}')">🗑️</div>
        </div>
    `).join('');
}

function addIdea() {
    const input = document.getElementById('ideaInput');
    const content = input.value.trim();
    if (!content) return;
    
    const ideas = Storage.get('ideas');
    ideas.push({
        id: Date.now().toString(),
        content,
        completed: false,
        createdAt: new Date().toISOString()
    });
    
    Storage.set('ideas', ideas);
    input.value = '';
    renderIdeas();
}

function toggleIdeaComplete(id) {
    const ideas = Storage.get('ideas');
    const idea = ideas.find(i => i.id === id);
    if (idea) {
        idea.completed = !idea.completed;
        Storage.set('ideas', ideas);
        renderIdeas();
    }
}

function deleteIdea(id) {
    const ideas = Storage.get('ideas').filter(i => i.id !== id);
    Storage.set('ideas', ideas);
    renderIdeas();
}

// ========== 稍后再看 ==========

function renderVideos() {
    const videos = Storage.get('videos');
    const container = document.getElementById('videosList');
    
    if (videos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 16px;">📺</div>
                <div>还没有保存视频</div>
                <div style="font-size: 14px; margin-top: 8px;">粘贴链接保存想看的视频</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = videos.slice().reverse().map(video => `
        <div class="glass-card video-card" onclick="openVideo('${video.url}')">
            <div class="video-thumbnail">▶️</div>
            <div class="video-info">
                <div class="video-title">${video.title || '未命名视频'}</div>
                <div class="video-platform">${video.platform} · ${new Date(video.createdAt).toLocaleDateString('zh-CN')}</div>
                ${video.tags ? `<div style="margin-top: 8px;">${video.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function addVideo() {
    const input = document.getElementById('videoUrlInput');
    const url = input.value.trim();
    if (!url) return;
    
    const videoInfo = parseVideoUrl(url);
    
    const videos = Storage.get('videos');
    videos.push({
        id: Date.now().toString(),
        url,
        title: videoInfo.title,
        platform: videoInfo.platform,
        tags: videoInfo.tags,
        createdAt: new Date().toISOString()
    });
    
    Storage.set('videos', videos);
    input.value = '';
    renderVideos();
}

function parseVideoUrl(url) {
    let platform = '未知平台';
    let title = '视频链接';
    let tags = [];
    
    if (url.includes('douyin.com') || url.includes('iesdouyin.com')) {
        platform = '抖音';
        title = '抖音视频';
        tags = ['短视频'];
    } else if (url.includes('bilibili.com') || url.includes('b23.tv')) {
        platform = 'B站';
        title = 'B站视频';
        tags = ['长视频'];
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = 'YouTube';
        title = 'YouTube视频';
        tags = ['海外'];
    } else if (url.includes('xiaohongshu.com')) {
        platform = '小红书';
        title = '小红书视频';
        tags = ['生活'];
    } else if (url.includes('kuaishou.com')) {
        platform = '快手';
        title = '快手视频';
        tags = ['短视频'];
    }
    
    return { platform, title, tags };
}

function openVideo(url) {
    window.open(url, '_blank');
}

// ========== 通用函数 ==========

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function updateStats() {
    updateHabitStats();
    updateWorkoutStats();
}

// 点击遮罩关闭弹窗
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
        }
    });
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Storage,
        encouragements,
        exerciseDetails,
        calculateStreak,
        toggleHabit,
        addHabit,
        showEncouragement,
        hideEncouragementModal,
        showAddHabitModal,
        selectIcon,
        updateHabitStats,
        renderHabits,
        renderWorkouts,
        showAddWorkoutModal,
        addExercise,
        startRestTimer,
        stopRestTimer,
        addSet,
        updateSet,
        removeSet,
        saveWorkout,
        deleteWorkout,
        updateWorkoutStats,
        renderIdeas,
        addIdea,
        toggleIdeaComplete,
        deleteIdea,
        renderVideos,
        addVideo,
        parseVideoUrl,
        openVideo,
        hideModal,
        updateStats,
        switchPage,
        updateDate,
        renderWorkoutExercises,
        toggleExerciseDetail,
        get currentWorkout() { return currentWorkout; },
        set currentWorkout(val) { currentWorkout = val; },
        get selectedIcon() { return selectedIcon; },
        set selectedIcon(val) { selectedIcon = val; },
        get restTimerInterval() { return restTimerInterval; },
        set restTimerInterval(val) { restTimerInterval = val; }
    };
}
