import { api } from "../../scripts/api.js";
import { app } from "../../scripts/app.js";
import { sleep } from "./common.js";

async function tryInstallCustomNode(event) {
	let msg = '-= [ComfyUI管理器] 需要安装拓展 =-\n\n';
	msg += `'${event.detail.sender}' 需要安装以下拓展： '${event.detail.title}' . `;

	if(event.detail.target.installed == 'Disabled') {
		msg += '此拓展被禁用. 你想要启用它并重启吗'
	}
	else if(event.detail.target.installed == 'True') {
		msg += '这个拓展引入失败，可能是冲突或者缺少镜像，请到ComfyUI-Manager-CN项目页提出一个issue';
	}
	else {
		msg += `你想要安装它并重启吗`;
	}

	msg += `\n\n提示:\n${event.detail.msg}`;

	if(event.detail.target.installed == 'True') {
		alert(msg);
		return;
	}

	let res = confirm(msg);
	if(res) {
		if(event.detail.target.installed == 'Disabled') {
			const response = await api.fetchApi(`/customnode/toggle_active`, {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify(event.detail.target)
									});
		}
		else {
			await sleep(300);
			app.ui.dialog.show(`安装中... '${event.detail.target.title}'`);

			const response = await api.fetchApi(`/customnode/install`, {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify(event.detail.target)
									});

			if(response.status == 403) {
				show_message('由于当前的安全设置，这个操作不被允许');
				return false;
			}
		}

		let response = await api.fetchApi("/manager/reboot");
		if(response.status == 403) {
			show_message('由于当前的安全设置，这个操作不被允许');
			return false;
		}

		await sleep(300);

		app.ui.dialog.show(`重启中...`);
	}
}

api.addEventListener("cm-api-try-install-customnode", tryInstallCustomNode);
