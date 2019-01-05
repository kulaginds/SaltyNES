Как гласит описание форка:
```
A NES emulator in WebAssembly. Try it live:  http://workhorsy.org/SaltyNES/
```

# Требования к сборке
cmake 3.4.3 или новее

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
