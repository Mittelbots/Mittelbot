export NODE_OPTIONS=--max_old_space_size=1536

# Set version control configuration variables
export version_git_tag=false
export version_prefix=""
export version_sign_git_tag=false
export version_commit_hooks=true
export version_tag_prefix=""
export version_git_message="release/%s"
export version_suffix=""
export version_silent=false
export version_reset_git=true
export version_git_push=true

# Define version control shortcuts
alias version_major="echo 'Performing major version update...'"
alias version_minor="echo 'Performing minor version update...'"
alias version_patch="echo 'Performing patch version update...'"

