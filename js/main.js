// アーバンネイチャー北九州 - メインJS

// aria-live リージョンを通じて画面外に通知する
function announce(message) {
  let region = document.getElementById('js-live-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'js-live-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

document.addEventListener('DOMContentLoaded', () => {

  // ===== ハンバーガーメニュー =====
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    function openMenu() {
      hamburger.classList.add('active');
      mobileNav.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const firstFocusable = mobileNav.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }

    function closeMenu() {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }

    hamburger.addEventListener('click', () => {
      mobileNav.classList.contains('active') ? closeMenu() : openMenu();
    });

    // Escape キーで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) closeMenu();
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ===== モバイルナビ アコーディオン =====
  document.querySelectorAll('.mobile-nav__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const children = btn.closest('.mobile-nav__parent').nextElementSibling;
      const isOpen = children.classList.contains('is-open');
      document.querySelectorAll('.mobile-nav__children').forEach(el => el.classList.remove('is-open'));
      document.querySelectorAll('.mobile-nav__toggle').forEach(el => el.setAttribute('aria-expanded', 'false'));
      if (!isOpen) {
        children.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ===== アコーディオン =====
  document.querySelectorAll('.accordion__header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active', !item.classList.contains('active'));
    });
  });

  // ===== タブフィルタ（events ページ: aria-pressed 管理）=====
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabGroup.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          if (t.hasAttribute('aria-pressed')) t.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add('active');
        if (tab.hasAttribute('aria-pressed')) tab.setAttribute('aria-pressed', 'true');
        const category = tab.dataset.category;
        const grid = tabGroup.nextElementSibling;
        if (grid) {
          let count = 0;
          grid.querySelectorAll('[data-category]').forEach(item => {
            const show = category === 'all' || item.dataset.category === category;
            item.style.display = show ? '' : 'none';
            if (show) count++;
          });
          announce(`${count}件を表示中`);
        }
      });
    });
  });

  // ===== パンくずのカテゴリ階層（#cat= の遷移元に追従）=====
  // ハッシュを使う理由: ホストによっては .html → 拡張子なしへのリダイレクトで
  // クエリ文字列が失われるため。ハッシュはリダイレクトを跨いでも保持される。
  // ※Phase 1 で WordPress 化する際は PHP のサーバーサイド出力に置き換える
  const photoCategories = {
    sea: '海・干潟・ビオトープ', mountain: '山', river: '川', animal: '動物',
    plant: '植物', urbannature: '街と自然', produce: '農産品',
    etc: '昆虫・その他', contest: 'コンテスト作品'
  };
  // HTML側は主カテゴリを静的に出力済み。#cat= があればそれで上書きする
  const catCrumb = document.querySelector('.breadcrumb__list .js-cat-crumb a');
  if (catCrumb) {
    const cat = new URLSearchParams(location.hash.slice(1)).get('cat')
             || new URLSearchParams(location.search).get('cat');
    if (photoCategories[cat]) {
      catCrumb.href = cat + '.html';
      catCrumb.textContent = photoCategories[cat];
    }
  }

  // ===== 写真ライトボックス（拡大表示）=====
  // HTMLには拡大表示専用のマークアップを一切置かず、ここで <img> をボタンで包む。
  // レイアウト変更時にこの機能を意識せずに済み、やめるときはこのブロックを消すだけでよい。
  // 対象は地域ページのグリッド（div.photo-item）のみ。カテゴリページは
  // a.photo-item でリンクになっており、a の中に button は入れられないため除外する。
  const zoomTargets = document.querySelectorAll('.photo-grid > div.photo-item > img');
  if (zoomTargets.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '写真の拡大表示');
    box.innerHTML = '<button type="button" class="lightbox__close" aria-label="閉じる">×</button>'
                  + '<img class="lightbox__img" alt="">';
    document.body.appendChild(box);

    const boxImg = box.querySelector('.lightbox__img');
    const closeBtn = box.querySelector('.lightbox__close');
    let lastFocused = null;

    function openLightbox(btn) {
      const img = btn.querySelector('img');
      lastFocused = btn;
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      box.classList.add('active');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      box.classList.remove('active');
      boxImg.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    zoomTargets.forEach(img => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'photo-item__zoom';
      btn.setAttribute('aria-label', `${img.alt || '写真'}を拡大表示`);
      img.parentNode.insertBefore(btn, img);
      btn.appendChild(img);
      btn.addEventListener('click', () => openLightbox(btn));
      // 個別保存ボタン（ホバーで表示、クリックしても拡大が発火しない）
      const saveBtn = document.createElement('a');
      saveBtn.className = 'photo-item__save';
      saveBtn.textContent = '保存';
      saveBtn.href = img.src;
      saveBtn.download = decodeURIComponent(img.src.split('/').pop());
      saveBtn.addEventListener('click', (e) => e.stopPropagation());
      btn.parentElement.appendChild(saveBtn);
    });
    closeBtn.addEventListener('click', closeLightbox);
    // 背景のクリックで閉じる（画像自体のクリックでは閉じない）
    box.addEventListener('click', (e) => { if (e.target === box) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && box.classList.contains('active')) closeLightbox();
    });

    // ===== 一括ダウンロードボタン =====
    const photoGrid = document.querySelector('.photo-grid');
    if (photoGrid) {
      const bar = document.createElement('div');
      bar.className = 'photo-bulk-dl';
      const bulkBtn = document.createElement('button');
      bulkBtn.type = 'button';
      bulkBtn.className = 'photo-bulk-dl__btn';
      bulkBtn.textContent = 'すべての写真をまとめてDL';
      bar.appendChild(bulkBtn);
      photoGrid.parentElement.insertBefore(bar, photoGrid);

      bulkBtn.addEventListener('click', async () => {
        bulkBtn.disabled = true;
        bulkBtn.textContent = '準備中...';
        // JSZipを初回のみ動的ロード
        if (!window.JSZip) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = new URL('../js/jszip.min.js', location.href).href;
            s.onload = resolve;
            s.onerror = () => reject(new Error('JSZipの読み込みに失敗しました'));
            document.head.appendChild(s);
          });
        }
        const zip = new JSZip();
        const imgs = Array.from(photoGrid.querySelectorAll('div.photo-item img'));
        let done = 0;
        await Promise.all(imgs.map(async (img) => {
          try {
            const src = img.currentSrc || img.src;
            const res = await fetch(src);
            const blob = await res.blob();
            const filename = decodeURIComponent(src.split('/').pop());
            zip.file(filename, blob);
          } catch (err) {
            console.warn('画像の取得に失敗:', img.src, err);
          }
          done++;
          bulkBtn.textContent = `準備中... ${done}/${imgs.length}枚`;
        }));
        const content = await zip.generateAsync({ type: 'blob' });
        const pageTitle = (document.querySelector('h1')?.textContent?.trim() || 'photos')
          .replace(/[\\/:*?"<>|]/g, '_');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${pageTitle}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
        bulkBtn.disabled = false;
        bulkBtn.textContent = 'すべての写真をまとめてDL';
      });
    }
  }

  // ===== スムーススクロール =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return; // プレースホルダーリンクはスキップ
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== フォームバリデーション =====
  document.querySelectorAll('form').forEach(form => {
    // aria-live 用エラー表示エリアを各フォームに追加
    let statusEl = form.querySelector('.form-status');
    if (!statusEl) {
      statusEl = document.createElement('p');
      statusEl.className = 'form-status sr-only';
      statusEl.setAttribute('aria-live', 'assertive');
      statusEl.setAttribute('aria-atomic', 'true');
      form.prepend(statusEl);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(field => {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
        if (field.type === 'email' && field.value) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            field.classList.add('error');
            valid = false;
          }
        }
      });

      const privacyCheck = form.querySelector('input[name="privacy"]');
      if (privacyCheck && !privacyCheck.checked) {
        valid = false;
        statusEl.textContent = 'プライバシーポリシーへの同意が必要です。';
        privacyCheck.focus();
        return;
      }

      if (valid) {
        statusEl.textContent = '送信が完了しました。';
        form.reset();
      } else {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        statusEl.textContent = '入力内容に誤りがあります。赤くなっている項目を確認してください。';
      }
    });
  });

});
