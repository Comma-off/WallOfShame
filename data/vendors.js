/**
 * Source of truth: docs/wall-of-shame.md
 *
 * tier      — key into TIERS (see assets/app.js)
 * verdict   — the one-line answer, written the way an owner would ask it
 * detail    — the full picture from the wall
 * evidence  — the specific mechanisms, shown as chips
 * source    — where a reader can check the claim. Omit the whole field when
 *             there is no manufacturer statement or substantial article to
 *             point at; the card then simply shows no Learn more button.
 *             kind: 'official' | 'news' | 'reference'
 */
window.WALL_DATA = {
  updated: '2026-09-01',
  vendors: [
    {
      name: 'Samsung',
      tier: 'impossible',
      verdict: 'Locked shut from One UI 8.0 onward.',
      detail:
        'Samsung removed bootloader unlocking entirely starting with One UI 8.0. Hardware-fused binaries block rollbacks to older firmware, and on the versions that could still unlock, doing so permanently blows the Knox fuse.',
      evidence: ['One UI 8.0', 'Knox e-fuse', 'anti-rollback fuses'],
      source: {
        url: 'https://9to5google.com/2025/07/26/samsung-galaxy-one-ui-8-bootloader-unlock/',
        label: '9to5Google',
        kind: 'news',
      },
    },
    {
      name: 'Huawei',
      tier: 'impossible',
      verdict: 'The unlock portal closed years ago and never reopened.',
      detail:
        'Huawei shut down its official unlock-code portals years ago. What is left is dangerous physical hardware exploits or paid third-party cracking tools — nothing sanctioned, nothing safe.',
      evidence: ['portal shut down', 'no official route', 'hardware exploits only'],
      source: {
        url: 'https://consumer.huawei.com/en/community/details/topicId-41529/',
        label: 'Huawei statement',
        kind: 'official',
      },
    },
    {
      name: 'Asus',
      tier: 'impossible',
      verdict: 'The unlock app was switched off and never replaced.',
      detail:
        'Asus permanently disabled its cloud-based unlock utility and went silent on updates. Every modern Zenfone and ROG Phone is locked for the life of the device.',
      evidence: ['unlock app disabled', 'Zenfone', 'ROG Phone'],
      source: {
        url: 'https://www.androidpolice.com/asus-removed-bootloader-unlock-from-phones/',
        label: 'Android Police',
        kind: 'news',
      },
    },
    {
      name: 'Vivo',
      tier: 'impossible',
      verdict: 'No tool, no method, no toggle.',
      detail:
        'Vivo maintains a strict, total lockdown on global configurations. There is no official mechanism of any kind to unlock the bootloader.',
      evidence: ['global lockdown', 'no official tool'],
      source: {
        url: 'https://www.xda-developers.com/vivo-unofficial-bootloader-unlock-x70-pro-plus/',
        label: 'XDA Developers',
        kind: 'news',
      },
    },
    {
      name: 'HONOR',
      tier: 'impossible',
      verdict: 'No unlock program exists for current devices.',
      detail:
        'HONOR runs no official consumer bootloader-unlock program for its modern devices, according to recent responses from company support.',
      evidence: ['no unlock program', 'confirmed by support'],
      source: {
        url: 'https://www.xda-developers.com/honor-huawei-bootloader-unlock-page-disappears/',
        label: 'XDA Developers',
        kind: 'news',
      },
    },
    {
      name: 'OPPO',
      tier: 'extreme',
      verdict: 'Not officially impossible. Effectively locked anyway.',
      detail:
        "OPPO's current security infrastructure is built around preventing unauthorised unlocking, resetting and ROM flashing. Official consumer unlock availability on modern global devices is restricted to the point of being theoretical.",
      evidence: ['heavily restricted', 'anti-flash architecture', 'global models'],
      source: {
        url: 'https://github.com/zenfyrdev/bootloader-unlock-wall-of-shame/blob/main/brands/oppo/README.md',
        label: 'Community reference',
        kind: 'reference',
      },
    },
    {
      name: 'Xiaomi',
      tier: 'hard',
      verdict: 'Forum thresholds, a server queue, and it can relock itself.',
      detail:
        'Unlocking needs a long chain of steps plus approval: account binding, forum-level requirements, and a server-side queue. Approvals sometimes expire, and the device can relock after a period.',
      evidence: ['approval queue', 'forum-level requirement', 'can relock'],
      source: {
        url: 'https://www.notebookcheck.net/Xiaomi-will-reportedly-end-its-global-bootloader-unlock-program.898104.0.html',
        label: 'Notebookcheck',
        kind: 'news',
      },
    },
    {
      name: 'Lenovo',
      tier: 'hard',
      verdict: 'Apply, wait, then flash an image by hand.',
      detail:
        'Lenovo requires an application through a slow web portal to receive a custom unlock image file, which then has to be flashed manually over fastboot.',
      evidence: ['portal application', 'custom unlock image', 'manual flash'],
      source: {
        url: 'https://www.zui.com/iunlock',
        label: 'Lenovo unlock portal',
        kind: 'official',
      },
    },
    {
      name: 'Realme',
      tier: 'hard',
      verdict: 'Depends on the model, and it is getting worse.',
      detail:
        'Older Realme devices offered reasonably developer-oriented unlocking procedures. Newer generations are increasingly restricted, and what is possible depends on region and model.',
      evidence: ['model dependent', 'region dependent', 'tightening'],
      source: {
        url: 'https://c.realme.com/in/post-details/1476520599785316352',
        label: 'realme Community',
        kind: 'official',
      },
    },
    {
      name: 'ZTE / nubia / RedMagic',
      tier: 'varies',
      verdict: 'There is no single ZTE policy. That is the policy.',
      detail:
        'Highly model-dependent. Some devices expose OEM unlocking and can be modified through ordinary developer-oriented methods; others require substantially more invasive procedures. A particularly delightful way to make Android development needlessly interesting.',
      evidence: ['no unified policy', 'model dependent', 'OEM unlocking on some'],
      source: {
        url: 'https://github.com/zenfyrdev/bootloader-unlock-wall-of-shame/blob/main/brands/zte/README.md',
        label: 'Community reference',
        kind: 'reference',
      },
    },
    {
      name: 'Motorola',
      tier: 'medium',
      verdict: 'A key by email — and your warranty, permanently.',
      detail:
        'Motorola issues a digital unlock key through an online form. It arrives quickly, and it instantly and permanently voids the hardware warranty on their servers.',
      evidence: ['online form', 'digital key', 'warranty voided server-side'],
      source: {
        url: 'https://en-us.support.motorola.com/app/standalone/bootloader/unlock-your-device-a',
        label: 'Motorola Support',
        kind: 'official',
      },
    },
    {
      name: 'Sony',
      tier: 'medium',
      verdict: 'An IMEI token, at the cost of the camera stack.',
      detail:
        "Sony generates an unlock token from your phone's IMEI on their developer site. Using it can permanently break the proprietary camera processing algorithms the phone was bought for.",
      evidence: ['IMEI token', 'developer site', 'breaks camera processing'],
      source: {
        url: 'https://developer.sony.com/develop/open-devices/get-started/unlock-bootloader/',
        label: 'Sony Open Devices',
        kind: 'official',
      },
    },
    {
      name: 'Google',
      tier: 'easy',
      verdict: 'A developer-settings toggle and one fastboot command.',
      detail:
        'Enable OEM unlocking in developer settings, run fastboot, done. Zero corporate approval, no waiting period, and hardware security features stay intact.',
      evidence: ['fastboot', 'no approval', 'no waiting period'],
      source: {
        url: 'https://source.android.com/docs/core/architecture/bootloader/locking_unlocking',
        label: 'Android Open Source',
        kind: 'official',
      },
    },
    {
      name: 'OnePlus',
      tier: 'easy',
      verdict: 'Easy on OxygenOS. The catch arrives with ColorOS 16.',
      detail:
        'Global OxygenOS devices still use the same open fastboot flow as Google. The "Deep Testing" application requirement attaches to devices running ColorOS 16 or newer, so it lands on you the moment your phone moves to it — and OnePlus’ exit from the EU and North American markets makes future support unstable.',
      evidence: ['fastboot on OxygenOS', 'Deep Testing on ColorOS 16+', 'EU + NA market exit'],
      source: {
        url: 'https://oxygenupdater.com/article/530/',
        label: 'Oxygen Updater',
        kind: 'news',
      },
    },
    {
      name: 'Nothing',
      tier: 'easy',
      verdict: 'Simple fastboot commands, nothing taken away.',
      detail:
        'Nothing keeps plain fastboot commands open to support custom developer options, and unlocking does not break device features.',
      evidence: ['fastboot', 'no approval', 'features stay intact'],
      source: {
        url: 'https://www.xda-developers.com/how-to-bootloader-unlock-root-magisk-nothing-phone-1/',
        label: 'XDA Developers',
        kind: 'news',
      },
    },
    {
      name: 'Fairphone',
      tier: 'easy',
      verdict: 'A free unlock generator on the official site.',
      detail:
        'Fairphone publishes a free, automatic unlock code generator directly on its own website, specifically to encourage open-source systems like /e/OS and Ubuntu Touch.',
      evidence: ['free code generator', '/e/OS', 'Ubuntu Touch'],
      source: {
        url: 'https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-or-lock-your-Fairphone-s-bootloader',
        label: 'Fairphone Support',
        kind: 'official',
      },
    },
  ],
};
