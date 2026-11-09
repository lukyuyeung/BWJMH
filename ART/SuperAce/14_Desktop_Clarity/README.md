# 桌面清晰度與頂部留白修訂

- [桌面修改前](desktop-before-desktop.png)／[修改後](desktop-after-desktop.png)
- [窄桌面修改前](desktop-before-narrow.png)／[修改後](desktop-after-narrow.png)
- [手機修改前](desktop-before-mobile.png)／[修改後](desktop-after-mobile.png)

直屏背景之前覆蓋整個桌面視窗，導致原941×1672背景在寬螢幕放大裁切。現在背景只覆蓋最多440px寬的直屏遊戲舞台。桌面舞台高度上限820px，保持畫面集中，桌面內容由頂部排列；倍率欄距頂欄由約63px改為4px。窄桌面滑鼠模式同樣修正。

普通牌取消額外的 image-rendering:pixelated，改用正常縮小取樣；保留原有角色的像素／voxel畫風，沒有重畫或假稱已補出原圖不存在的細節。

觸控手機的舞台、牌位及倍率位置對比修改前保持一致。測試1440×900 DPR1、1920×1080 DPR1、1280×720 DPR2、450×900 DPR1、390×844觸控DPR3；背景與舞台對齊、桌面無頂部空白、無裁切捲動、牌面正常取樣通過。原六種手機尺寸的單屏及Auto檢查也通過。
