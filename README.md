Как гласит описание [форка](https://github.com/workhorsy/SaltyNES):
```
A NES emulator in WebAssembly.
```

# Требования к сборке
cmake 3.4.3 или новее

python 2

SDL2

# Сборка и запуск веб-сервера
```bash
./init_web.sh
./make_web.sh
cd web
python -m SimpleHTTPServer 9999
```

Открываем браузер на странице http://127.0.0.1:9999 и любуемся.

Сборка тестировалась на ОС Ubuntu 18.04.1 LTS.
