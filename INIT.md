### 初始化  
* 创建项目

    ```bash
    npx react-native init DogerBrowser --template react-native-template-typescript
    ```

* 代码规范  

    ```bash
    npm install husky@">=6.0.0" lint-staged --save-dev
    npm install @commitlint/cli @commitlint/config-conventional --save-dev

    npm set-script prepare "husky install"
    npm run prepare

    npx husky add .husky/pre-commit "npx lint-staged"
    npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"' 
    ```

* * /package.json

        "scripts": {
            "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
            "lint-staged": "lint-staged",
            "prepare": "husky install"
        },
        "lint-staged": {
            "*.{js,jsx,ts,tsx}": "eslint --fix"
        }

* * /commitlint.config

        module.exports = {
          extends: ['@commitlint/config-conventional'],
        };

* * commitizen

        feat: 新功能（feature）
        fix: 修补bug
        docs: 文档（documentation）
        style: 格式（不影响代码运行的变动）
        refactor: 重构（即不是新增功能，也不是修改bug的代码变动）
        test: 增加测试
        chore: 构建过程或辅助工具的变动

* 别名

    ```bash
    npm install eslint-plugin-import eslint-import-resolver-alias --save-dev
    npm install babel-plugin-module-resolver --save-dev
    ```

* * /tsconfig.json

        {
          "compilerOptions": {
                "baseUrl": "./",
                "paths": {
                  "@/*": ["src/*"],
                },
                "resolveJsonModule": true,
            },
        }

* * /babel.config.js

        const path = require('path');
        module.exports = {
            plugins: [
                [
                    'module-resolver',
                    {
                        alias: {
                            '@': path.join(__dirname, './src'),
                        },
                    },
                ],
            ],
        };


### 常用命令
```bash
./android/gradlew.bat clean

adb devices

npx react-native run-android --variant=release

npx react-native log-android

adb logcat "*:W" | grep "TAG"

```


### 常见问题
1. > Deprecated Gradle features were used in this build, making it incompatible with Gradle 6.0 
    ```bash
        npm i
    ```

2. > Error: spawn ./gradlew EACCES
    ```bash
        chmod 755 android/gradlew 
    ``` 

3. > Execution failed for task ':app:installDebug'.  
   > java.util.concurrent.ExecutionException: com.android.builder.testing.api.DeviceException: com.android.ddmlib.InstallException: Unknown failure: Exception occurred while executing 'install'
    ```
        删除打包的apk文件
    ```  

### 常用资源
1. > https://easylist-downloads.adblockplus.org/easylistchina.txt

2. > https://developer.android.com/reference

3. > https://publicsuffix.org/learn/
