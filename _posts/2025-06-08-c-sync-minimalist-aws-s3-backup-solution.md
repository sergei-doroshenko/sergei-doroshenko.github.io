---
layout: post
title: "c-sync: A Minimalist AWS S3 Backup Solution"
date: 2025-06-08
categories: [tools, aws, bash]
tags: [aws, s3, backup, bash, cli]
---

In the world of cloud storage solutions, sometimes the simplest tools are the most effective. Today, I'm excited to share **c-sync**, a lightweight bash script that makes backing up files to AWS S3 a breeze.

## Why c-sync?

While there are many backup solutions available, c-sync stands out for its simplicity. With just a few hundred lines of code, it provides all the essential functionality you need for S3 backups:
- Backup files and directories
- Sync local changes with cloud storage
- List cloud contents
- Simple command-line interface

## Key Features

1. **Minimalist Design**: The entire solution is contained in a single bash script, making it easy to understand and modify.

2. **Flexible Path Handling**:
   - Works with relative paths
   - Supports absolute paths
   - Handles home directory paths (~)
   - Defaults to current directory

3. **Smart Configuration**:
   - Uses AWS CLI profiles for secure credential management
   - Simple configuration file for bucket and path settings
   - Runs from any directory while maintaining consistent S3 paths

## Getting Started

Setup is straightforward:
1. Clone the repository
2. Create your config file from the template
3. Set your AWS bucket and profile
4. Start backing up!

## Example Usage

```bash
# Backup a file
c-sync bu document.txt

# Sync a directory
c-sync sync Photos/

# List cloud contents
c-sync ls
```

## Why I Created It

I needed a simple, reliable way to backup files to S3 without the complexity of full-featured backup solutions. The result is c-sync - a tool that does one thing and does it well.

## Open Source

c-sync is open source under the Apache License 2.0. Feel free to use it, modify it, or contribute to its development at [GitHub](https://github.com/sergei-doroshenko/c-sync).
