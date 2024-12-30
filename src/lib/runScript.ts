import { Console } from '../polyfill/Console';
import { Storage } from '../polyfill/Storage';
import { fetch } from '../polyfill/fetch';

export async function runScript(script: string, runOpts: { timeout?: number } = {}) {
  try {
    // 获取 httpapi 配置
    const httpapi = Storage.getItem('@chavy_boxjs_userCfgs.httpapi')?.replace(/\n/g, '')?.trim();
    if (!httpapi) {
      throw new Error('httpapi 配置未找到，请检查配置项！');
    }

    // 设置超时时间，优先使用参数传入的值
    const httpapiTimeoutFromConfig = Number.parseInt(
      Storage.getItem('@chavy_boxjs_userCfgs.httpapi_timeout') || '20',
      10,
    );
    const timeout = runOpts.timeout ?? httpapiTimeoutFromConfig;

    // 解析 httpapi 的地址和密码
    const [password, address] = httpapi.split('@');
    if (!password || !address) {
      throw new Error('httpapi 配置格式错误，应为 password@address 格式！');
    }

    // 构建请求对象
    const request = {
      url: `http://${address}/v1/scripting/evaluate`,
      body: JSON.stringify({
        script_text: script,
        mock_type: 'cron',
        timeout,
      }),
      headers: {
        'X-Key': password,
        Accept: '*/*',
      },
      timeout,
    };

    // 发起请求
    const response = await fetch(request);
    return response.body; // 返回响应体
  } catch (error) {
    // 捕获错误并打印
    Console.error('运行脚本时发生错误：', (error as Error).message);
    throw error; // 如果需要，可以重新抛出错误
  }
}
