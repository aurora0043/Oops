let 題庫資料 = JSON.parse(localStorage.getItem("題庫資料")) || {};

let 當前題庫 = null;



function 載入題庫選單() {

  const 選單 = document.getElementById("題庫選擇");

  選單.innerHTML = "";

  Object.keys(題庫資料).forEach(tk => {

    const option = document.createElement("option");

    option.value = tk;

    option.textContent = tk;

    選單.appendChild(option);

  });

  選單.onchange = () => {

    當前題庫 = 選單.value;

  };

  if (Object.keys(題庫資料).length > 0) {

    選單.value = Object.keys(題庫資料)[0];

    當前題庫 = 選單.value;

  }

}



function 新增題庫() {

  const 名稱 = document.getElementById("新題庫名稱").value.trim();

  if (名稱 && !題庫資料[名稱]) {

    題庫資料[名稱] = [];

    localStorage.setItem("題庫資料", JSON.stringify(題庫資料));

    document.getElementById("新題庫名稱").value = "";

    載入題庫選單();

  } else {

    alert("請輸入新題庫名稱或題庫已存在！");

  }

}



function 新增一題() {

  const 區 = document.getElementById("題目輸入區");

  const div = document.createElement("div");

  div.className = "題目區塊";

  div.innerHTML = `

    <input type="text" placeholder="題目內容" class="題目內容" /><br />

    <input type="text" placeholder="選項 A" class="選項" />

    <input type="text" placeholder="選項 B" class="選項" />

    <input type="text" placeholder="選項 C" class="選項" />

    <input type="text" placeholder="選項 D" class="選項" /><br />

    <input type="text" placeholder="正確答案 A/B/C/D" class="答案" />

    <textarea placeholder="解釋" class="解釋"></textarea>

    <hr />

  `;

  區.appendChild(div);

}



function 儲存閱讀組() {

  const passage = document.getElementById("閱讀文章").value.trim();

  const 區塊 = document.querySelectorAll(".題目區塊");

  if (!當前題庫 || 區塊.length === 0) {

    alert("請選擇題庫並新增題目");

    return;

  }



  const questions = [];

  區塊.forEach(div => {

    const q = div.querySelector(".題目內容").value.trim();

    const opts = Array.from(div.querySelectorAll(".選項")).map(i => i.value.trim());

    const ans = div.querySelector(".答案").value.trim().toUpperCase();

    const exp = div.querySelector(".解釋").value.trim();



    if (!q || opts.some(o => !o) || !["A","B","C","D"].includes(ans)) return;

    questions.push({ question: q, options: opts, answer: ans, explanation: exp });

  });



  if (questions.length === 0) {

    alert("請填寫完整的題目與選項");

    return;

  }



  const group = { passage, questions };

  題庫資料[當前題庫].push(group);

  localStorage.setItem("題庫資料", JSON.stringify(題庫資料));

  document.getElementById("閱讀文章").value = "";

  document.getElementById("題目輸入區").innerHTML = "";

  alert("閱讀組儲存成功！");

}



function 儲存單題() {

  const q = document.getElementById("單題內容").value.trim();

  const opts = Array.from(document.querySelectorAll(".單題選項")).map(i => i.value.trim());

  const ans = document.getElementById("單題答案").value.trim().toUpperCase();

  const exp = document.getElementById("單題解釋").value.trim();



  if (!當前題庫 || !q || opts.some(o => !o) || !["A","B","C","D"].includes(ans)) {

    alert("請填寫完整題目與四個選項，並輸入 A~D 的正確答案！");

    return;

  }



  const group = {

    passage: "",

    questions: [{ question: q, options: opts, answer: ans, explanation: exp }]

  };



  題庫資料[當前題庫].push(group);

  localStorage.setItem("題庫資料", JSON.stringify(題庫資料));



  document.getElementById("單題內容").value = "";

  document.querySelectorAll(".單題選項").forEach(i => i.value = "");

  document.getElementById("單題答案").value = "";

  document.getElementById("單題解釋").value = "";



  alert("單題儲存成功！");

}



function 匯出資料() {

  const blob = new Blob([JSON.stringify(題庫資料, null, 2)], { type: "application/json" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "題庫備份.json";

  a.click();

  URL.revokeObjectURL(url);

}



function 匯入資料(event) {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = e => {

    try {

      題庫資料 = JSON.parse(e.target.result);

      localStorage.setItem("題庫資料", JSON.stringify(題庫資料));

      載入題庫選單();

      alert("資料匯入成功！");

    } catch {

      alert("匯入失敗，請確認檔案格式正確！");

    }

  };

  reader.readAsText(file);

}



// 練習功能（practice.html）

let 所有題目 = [];

let 當前題目 = 0;

function 隨機化題目() {

  所有題目 = [];

  const 所有群組 = Object.values(題庫資料).flat();

  所有群組.forEach(g => g.questions.forEach(q => {

    所有題目.push({ passage: g.passage, ...q });

  }));

  所有題目 = 所有題目.sort(() => Math.random() - 0.5);

  當前題目 = 0;

  下一題();

}



function 下一題() {

  const 題 = 所有題目[當前題目++];

  if (!題) {

    document.getElementById("練習區").innerHTML = "<p>已完成所有題目！</p>";

    return;

  }



  document.getElementById("文章區塊").textContent = 題.passage || "";

  document.getElementById("題目區塊").textContent = 題.question;



  const 選項區塊 = document.getElementById("選項區塊");

  選項區塊.innerHTML = "";

  ["A", "B", "C", "D"].forEach((l, i) => {

    const btn = document.createElement("button");

    btn.textContent = `${l}. ${題.options[i]}`;

    btn.onclick = () => {

      document.getElementById("解釋區塊").style.display = "block";

      document.getElementById("解釋區塊").innerHTML =

        l === 題.answer

          ? `<b>答對了！</b><br>${題.explanation}`

          : `<b>答錯了，正確答案是 ${題.answer}</b><br>${題.explanation}`;

      document.getElementById("下一題按鈕").style.display = "inline-block";

    };

    選項區塊.appendChild(btn);

  });



  document.getElementById("解釋區塊").style.display = "none";

  document.getElementById("下一題按鈕").style.display = "none";

}



if (document.readyState !== "loading") {

  if (document.getElementById("題庫選擇")) 載入題庫選單();

  if (document.getElementById("練習區")) 隨機化題目();

} else {

  document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("題庫選擇")) 載入題庫選單();

    if (document.getElementById("練習區")) 隨機化題目();

  });

}