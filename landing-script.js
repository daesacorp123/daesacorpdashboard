// Dashboard Marketing Landing Page - Fixed Version
console.log('Dashboard Marketing page loaded');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, attaching event listeners');
    
    // ===== 1. SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== 2. BUTTON CLICK HANDLERS (EXCLUDE LINKS) =====
    document.querySelectorAll('.btn').forEach(function(button) {
        // Skip jika ini adalah link (anchor tag dengan href)
        if (button.tagName === 'A' && button.getAttribute('href')) {
            console.log('Skipping event for link:', button.getAttribute('href'));
            return;
        }
        
        // Hanya untuk button yang bukan link
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const text = this.textContent || this.innerText || '';
            let message = '';
            
            if (text.includes('Konsultasi') || text.includes('konsultasi')) {
                message = '📞 Terima kasih! Tim kami akan menghubungi dalam 1x24 jam.';
            } else if (text.includes('Tingkatkan') || text.includes('tingkatkan')) {
                message = '⚡ Mengarahkan ke halaman upgrade...';
            } else if (text.includes('Jadwalkan') || text.includes('jadwalkan')) {
                message = '📅 Silakan pilih waktu untuk jadwal demo.';
            } else if (text.includes('Pilih') || text.includes('pilih')) {
                message = '✅ Paket berhasil dipilih!';
            } else if (text.includes('Hubungi') || text.includes('hubungi')) {
                message = '📞 Tim sales akan menghubungi Anda.';
            } else if (text.includes('Login') || text.includes('login')) {
                message = '🔐 Mengarahkan ke halaman login...';
            } else {
                message = '✅ Terima kasih!';
            }
            
            alert(message);
        });
    });
    
    // ===== 3. MOBILE MENU TOGGLE =====
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // ===== 4. VIDEO DEMO CLICK =====
    const videoDemo = document.querySelector('.video-placeholder');
    if (videoDemo) {
        videoDemo.addEventListener('click', function() {
            this.innerHTML = `
                <div style="background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; color: white; text-align: center;">
                    <i class="fas fa-play-circle" style="font-size: 3rem;"></i>
                    <h3>Video Demo</h3>
                    <p>Dashboard marketing dalam aksi</p>
                </div>
            `;
            
            setTimeout(() => {
                this.innerHTML = `
                    <i class="fas fa-play"></i>
                    <p>Video Demo 60 Detik</p>
                `;
            }, 3000);
        });
    }
    
    console.log('All event listeners attached');
});