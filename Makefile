.PHONY: all
all: clean run

.PHONY: clean
clean:
	rm -rf public

.PHONY: run
run:
	hugo server

.PHONY: build
build:
	hugo --minify

.PHONY: deploy
deploy:
	ssh ${SSH_USERNAME}@${SSH_HOST} 'rm -rf /srv/www.hu553in.su'
	ssh ${SSH_USERNAME}@${SSH_HOST} 'mkdir -p /srv/www.hu553in.su'
	rsync -avz ./public/ ${SSH_USERNAME}@${SSH_HOST}:/srv/www.hu553in.su --progress
