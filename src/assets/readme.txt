ng-bootstrap
	npm install ng-bootstrap -S
	
angular-font-awesome

	npm install angular-font-awesome -S

datatables

	npm install jquery --save
	npm install datatables.net --save
	npm install datatables.net-dt --save
	npm install angular-datatables --save
	npm install @types/jquery --save-dev
	npm install @types/datatables.net --save-dev

	npm install datatables.net-bs
	
	npm install datatables.net-buttons 
	// "node_modules/datatables.net-bs/js/dataTables.bootstrap.min.js",              
	// "node_modules/datatables.net-buttons/js/dataTables.buttons.min.js",              
	// "node_modules/datatables.net-buttons/js/buttons.flash.min.js",
	// "node_modules/datatables.net-buttons/js/buttons.html5.min.js" 
			  
			  
Echarts
	npm install echarts -S
	npm install ngx-echarts -S
	npm install @types/echarts -D
	  
pivot-table	  
	npm i ngx-pivot-table

prevent-double-submission		
	npm i ngx-prevent-double-submission 
	
crypto
	npm install crypto-js --save
	npm install @types/crypto-js –save
	
toastr
	npm install ngx-toastr --save
	
device-detector 
	npm install ngx-device-detector --save
	
cookie-service 
	npm install ngx-cookie-service --save	

moment
	npm install --save moment ngx-moment
	
ngx-spinner
	npm install ngx-spinner
	
daterangepicker
	npm install ngx-daterangepicker-material --save   
 
mask
	npm install --save ngx-mask
	
ngx-select-dropdown
	npm install ngx-select-dropdown
	
autocomplete
	npm install ngx-typeahead --save-dev
	
pdf conversion
	npm i jspdf --save
    npm i html2canvas --save	
	
	
Telerilk Controls
	 ng add @progress/kendo-angular-inputs
	 npm install  @progress/kendo-angular-dateinputs	 
	 npm install  @progress/kendo-angular-grid
	 npm install  @progress/kendo-angular-dropdowns
	 
	 
ssrs
	npm install ngx-ssrs-reportviewer --save

	
addtional npms 
	 npm install @types/bootstrap
	 
	 npm install @angular/animations --save
	 
	 npm install --save @ng-bootstrap/ng-bootstrap
	 
	 ng add @angular/elements
	 
	 npm install --save rxjs-compat@6	 
	 
	 npm install --save web-animations-js 
	 
	 
build cmd
	 ng build --base-href /hrsuitesme/  build 

build cmd with production and aot complier
    ng build --prod --build-optimizer
    node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod --aot  --buildOptimizer --base-href=./

	ng build --prod --aot --base-href /hrsuite/ - OLD NORMAL PRODUCTION BUILD

	NEW AND JS MEMORY BAED PRODUCTION BUILD
	node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod --aot  --base-href /hrsuite/ 
    node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod --aot  --base-href=./ 

    node --max-old-space-size=12288 node_modules/@angular/cli/bin/ng serve --aot

Build Cache :
This will create a cache of the build artifacts that can be reused in future builds. Subsequent builds can then use the cache to skip the compilation of unchanged files, resulting in faster build times.
ng build --prod --cache

Parallelize Builds :
This will parallelize the build process, using multiple cores to build the application. The exact number of processes used is determined by the number of CPU cores available on your machine.
ng build --prod --parallel=4


ng server / ng build - error logs (node-sass)
npm install node-sass@4.12.0 --no-save  

UNSET GIT 

git config --global --unset http.proxy 127.0.0.1:9666
git config --global --unset https.proxy 127.0.0.1:9666

GIT COMMIT
git add .

ECHO Commit name? 
set /p done=

git commit -m  %done%

git push -u origin master


ECHO press any key to continue...: 
set /p done=

